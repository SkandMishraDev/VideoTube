export const asyncHandler = (requestHandler) => {
    return async (req, res, next) => {
        try {
            await requestHandler(req, res, next);
        } catch (error) {
            res.status(error.statusCode || 500).json({
                message: error.message,
                success: false,
            });
        }
    };
};
