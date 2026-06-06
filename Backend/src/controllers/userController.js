import User from '../models/User.js';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
// @desc    Lấy thông tin người dùng hiện tại (Profile)
// @route   GET /api/users/profile
// @access  Private (User/Admin)
export const getUserProfile = async (req, res) => {
    try {
        // req.user đã có từ middleware `protectedRoute`
        const user = await User.findById(req.user._id).select('-hashedPassword');
        if (user) {
            res.status(200).json({
                _id: user._id,
                username: user.username,
                displayName: user.displayName,
                email: user.email,
                role: user.role,
                phone: user.phone,
                address: user.address,
                avatarUrl: user.avatarUrl,
                bio: user.bio,
                isBlocked: user.isBlocked,
            });
        } else {
            res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }
    } catch (error) {
        console.error('Error in getUserProfile:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy thông tin cá nhân' });
    }
};
// export const updateUserProfile = async (req,res) => {
    
// }

export const changePassword = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.user._id });
        const { oldPassword, newPassword } = req.body;
        const hashPassword = await bcrypt.hash(newPassword, 10);
        const check = await bcrypt.compare(oldPassword, user.hashedPassword);
        if (check) {
            console.log(hashPassword);
            await User.findByIdAndUpdate(user._id, {
                hashedPassword: hashPassword
            })
            res.json({ message: "đã đổi mật khẩu", check: true });
        }
        else {
            res.json({ message: "sai mật khẩu ban đầu", check: false });
        }
    } catch (er) {
        console.log("error : ", er);
    }
}
// @desc    Cập nhật thông tin cá nhân
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            Object.assign(user,req.body);
            user.save();
            res.json({
                ...user,hashedPassword:""
            });
        } else {
            res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }
    } catch (error) {
        console.error('Error in updateUserProfile:', error);
        res.status(500).json({ message: 'Lỗi server khi cập nhật thông tin' });
    }
};

// @desc    Lấy danh sách tất cả user
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
    try {
        // Lấy tất cả user nhưng bỏ trường password
        const users = await User.find({}).select('-hashedPassword');
        res.status(200).json(users);
    } catch (error) {
        console.error('Error in getAllUsers:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy danh sách user' });
    }
};

// @desc    Xóa user theo ID
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            // Ngăn chặn admin tự xóa chính mình
            if (user._id.toString() === req.user._id.toString()) {
                return res.status(400).json({ message: 'Bạn không thể tự xóa tài khoản của chính mình' });
            }

            await user.deleteOne();
            res.status(200).json({ message: 'Đã xóa người dùng thành công' });
        } else {
            res.status(404).json({ message: 'Người dùng không tồn tại' });
        }
    } catch (error) {
        console.error('Error in deleteUser:', error);
        res.status(500).json({ message: 'Lỗi server khi xóa user' });
    }
};

// @desc    Khóa user
// @route   PUT /api/users/:id/block
// @access  Private/Admin
export const blockUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isBlocked: true },
            { new: true }
        ).select('-hashedPassword');

        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: 'Người dùng không tồn tại' });
        }
    } catch (error) {
        console.error('Error in blockUser:', error);
        res.status(500).json({ message: 'Lỗi server khi khóa user' });
    }
};

// @desc    Mở khóa user
// @route   PUT /api/users/:id/unblock
// @access  Private/Admin
export const unblockUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isBlocked: false },
            { new: true }
        ).select('-hashedPassword');

        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ message: 'Người dùng không tồn tại' });
        }
    } catch (error) {
        console.error('Error in unblockUser:', error);
        res.status(500).json({ message: 'Lỗi server khi mở khóa user' });
    }
};
export const setRole = async (req, res) => {

}

// @desc    Test route
// @route   GET /api/users/test
export const test = async (req, res) => {
    return res.status(200).json({ message: "User route is working!" });
};
