module.exports = function makeGetChildPages({ dataAccess, services, Joi }) {
    return async function getChildPages(req, res) {
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

        const { userId, id, workspaceId } = validationResult.value;

        try {
            const membership = await dataAccess.checkUserWorkspaceAccess(workspaceId, userId);
            if (!membership) return res.status(403).json({ message: 'Access denied to this workspace' });

            const page = await dataAccess.getPageWithPermissions(id, userId);
            if (!page) return res.status(404).json({ message: 'Page not found or access denied' });
            if (page.workspace_id !== workspaceId) return res.status(400).json({ message: 'Page does not belong to this workspace' });

            const cached = await services.getCachedChildPages(id);
            if (cached) return res.json({ pages: cached, source: 'cache' });

            const children = await dataAccess.getChildPages(id);
            await services.setCachedChildPages(id, children);

            return res.json({ pages: children, source: 'db' });
        } catch (err) {
            console.error('Error getting child pages', err);
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