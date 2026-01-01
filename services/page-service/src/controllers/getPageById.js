module.exports = function makeGetPageById({ dataAccess, services, businessLogic, Joi }) {
    return async function getPageById(req, res) {
        const validationResult = ValidateInput({
            userId: req.headers['x-user-id'],
            workspaceId: req.params.workspaceId,
            id: req.params.id
        });

        if (validationResult.error) {
            return res.status(400).json({
                message: 'Validation error',
                details: validationResult.error.details.map(d => ({ field: d.path.join('.'), message: d.message }))
            });
        }

        const { userId, workspaceId, id } = validationResult.value;

        try {
            const membership = await dataAccess.checkUserWorkspaceAccess(workspaceId, userId);
            if (!membership) return res.status(403).json({ message: 'Access denied to this workspace' });

            const cached = await services.getCachedPage(id);
            if (cached) {
                if (cached.workspace_id !== workspaceId) {
                    return res.status(400).json({ message: 'Page does not belong to this workspace' });
                }
                return res.json({ page: cached, source: 'cache' });
            }

            const page = await dataAccess.getPageWithPermissions(id, userId);
            if (!page) return res.status(404).json({ message: 'Page not found or access denied' });
            if (page.workspace_id !== workspaceId) {
                return res.status(400).json({ message: 'Page does not belong to this workspace' });
            }

            await services.setCachedPage(id, page);

            return res.json({ page, source: 'db' });
        } catch (err) {
            console.error('Error getting page', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };

    function ValidateInput({ userId, workspaceId, id }) {
        const schema = Joi.object({
            userId: Joi.string().uuid().required(),
            workspaceId: Joi.string().uuid().required(),
            id: Joi.string().uuid().required()
        });

        return schema.validate({ userId, workspaceId, id }, { abortEarly: false });
    }
};