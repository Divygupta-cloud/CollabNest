import os
import joblib
import faiss
import numpy as np
import pandas as pd

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from xgboost import XGBClassifier
from sklearn.model_selection import train_test_split


# ============================================================
# CONFIGURATION
# ============================================================

DATASET = "collabnest_text_dataset.csv"
MODEL_FILE = "rac_xgboost_model.json"
LABEL_ENCODER_FILE = "label_encoder.pkl"

TOP_K = 3


# ============================================================
# FASTAPI
# ============================================================

app = FastAPI(
    title="CollabNest AI Service",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================
# REQUEST MODEL
# ============================================================

class PredictionRequest(BaseModel):
    text: str


# ============================================================
# LOAD DATASET
# ============================================================

print("Loading dataset...")

df = pd.read_csv(DATASET)

df = df[
    df["text"].fillna("").str.strip() != ""
].copy()

df["text"] = df["text"].fillna("").astype(str)
df["final_class"] = df["final_class"].astype(str)

print("Total records:", len(df))


# ============================================================
# SAME TRAIN / TEST SPLIT AS ORIGINAL MODEL
# ============================================================

X_train, X_test, y_train, y_test = train_test_split(
    df["text"],
    df["final_class"],
    test_size=0.20,
    random_state=42,
    stratify=df["final_class"]
)

X_train = X_train.reset_index(drop=True)


# ============================================================
# LOAD SBERT
# ============================================================

print("Loading SBERT model...")

embedding_model = SentenceTransformer(
    "all-MiniLM-L6-v2"
)


# ============================================================
# CREATE TRAINING EMBEDDINGS
# ============================================================

print("Creating training embeddings...")

train_embeddings = embedding_model.encode(
    X_train.tolist(),
    batch_size=32,
    show_progress_bar=True,
    normalize_embeddings=True
)

train_embeddings = np.asarray(
    train_embeddings,
    dtype="float32"
)

print(
    "Embedding dimension:",
    train_embeddings.shape[1]
)


# ============================================================
# BUILD FAISS INDEX
# ============================================================

print("Building FAISS index...")

dimension = train_embeddings.shape[1]

index = faiss.IndexFlatIP(dimension)

index.add(train_embeddings)

print(
    "FAISS index contains:",
    index.ntotal,
    "historical tickets"
)


# ============================================================
# LOAD XGBOOST MODEL
# ============================================================

print("Loading XGBoost model...")

model = XGBClassifier()

model.load_model(MODEL_FILE)


# ============================================================
# LOAD LABEL ENCODER
# ============================================================

print("Loading label encoder...")

label_encoder = joblib.load(
    LABEL_ENCODER_FILE
)

print(
    "Classes:",
    list(label_encoder.classes_)
)


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/")
def root():
    return {
        "service": "CollabNest AI Service",
        "status": "running"
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "model": "SBERT + FAISS + RAC + XGBoost"
    }


# ============================================================
# AI PREDICTION
# ============================================================

@app.post("/predict")
def predict(request: PredictionRequest):

    text = request.text.strip()

    if not text:
        return {
            "error": "Task description cannot be empty."
        }


    # --------------------------------------------------------
    # 1. SBERT EMBEDDING
    # --------------------------------------------------------

    query_embedding = embedding_model.encode(
        [text],
        normalize_embeddings=True
    )

    query_embedding = np.asarray(
        query_embedding,
        dtype="float32"
    )


    # --------------------------------------------------------
    # 2. FAISS TOP-K RETRIEVAL
    # --------------------------------------------------------

    similarities, indices = index.search(
        query_embedding,
        TOP_K
    )

    similarities = similarities[0]
    indices = indices[0]


    # --------------------------------------------------------
    # 3. RETRIEVED CONTEXT
    # --------------------------------------------------------

    context_embeddings = np.mean(
        train_embeddings[indices],
        axis=0
    )

    context_embeddings = np.asarray(
        context_embeddings,
        dtype="float32"
    )


    # --------------------------------------------------------
    # 4. RAC FEATURE CONSTRUCTION
    # --------------------------------------------------------

    final_features = np.hstack([
        query_embedding[0],
        context_embeddings
    ])

    final_features = final_features.reshape(
        1,
        -1
    )


    # --------------------------------------------------------
    # 5. XGBOOST PREDICTION
    # --------------------------------------------------------

    prediction_encoded = model.predict(
        final_features
    )

    prediction_encoded = int(
        prediction_encoded[0]
    )

    category = label_encoder.inverse_transform(
        [prediction_encoded]
    )[0]


    # --------------------------------------------------------
    # 6. CONFIDENCE
    # --------------------------------------------------------

    probabilities = model.predict_proba(
        final_features
    )[0]

    confidence = float(
        probabilities[prediction_encoded]
    )


    # --------------------------------------------------------
    # 7. SIMILAR HISTORICAL ISSUES
    # --------------------------------------------------------

    similar_issues = []

    for similarity, idx in zip(
        similarities,
        indices
    ):

        similar_issues.append({
            "text": X_train.iloc[int(idx)],
            "similarity": round(
                float(similarity),
                4
            )
        })


    # --------------------------------------------------------
    # RESPONSE
    # --------------------------------------------------------

    return {
        "category": category,
        "confidence": round(
            confidence,
            4
        ),
        "similarIssues": similar_issues,
        "retrieval": {
            "topK": TOP_K
        }
    }