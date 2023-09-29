import { prisma } from '../config/prisma.client.js';
const UsersController = {
    getUsers: async (req, res) => {
        try {
            const users = await prisma.users.findMany({
                where: {
                    active: true
                }
            });
            if (users) {
                return res.status(200).json({
                    result: true,
                    message: 'Users found',
                    users
                });
            }
            return res.status(404).json({
                result: false,
                message: 'Users not found'
            });
        }
        catch (error) {
            console.log(error);
            res.status(500).json({
                result: false,
                message: 'Internal server error'
            });
        }
    }
};
export default UsersController;
//# sourceMappingURL=users.controller.js.map