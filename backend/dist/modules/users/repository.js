"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = exports.UserRepository = void 0;
const model_1 = require("./model");
class UserRepository {
    async findAll(filter, pagination) {
        const [users, total] = await Promise.all([
            model_1.UserModel.find(filter)
                .populate('teamIds', 'name department')
                .sort({ [pagination.sortBy]: pagination.order === 'asc' ? 1 : -1 })
                .skip(pagination.skip)
                .limit(pagination.limit),
            model_1.UserModel.countDocuments(filter),
        ]);
        return { users, total };
    }
    async findById(id) {
        return model_1.UserModel.findById(id).populate('teamIds', 'name department');
    }
    async findByUsernameOrEmail(username, email) {
        return model_1.UserModel.findOne({
            $or: [{ username: username.toLowerCase() }, { email: email.toLowerCase() }],
        });
    }
    async create(data) {
        return model_1.UserModel.create(data);
    }
    async update(id, updates) {
        return model_1.UserModel.findByIdAndUpdate(id, updates, { new: true }).populate('teamIds', 'name department');
    }
    async delete(id) {
        return model_1.UserModel.findByIdAndDelete(id);
    }
}
exports.UserRepository = UserRepository;
exports.userRepository = new UserRepository();
