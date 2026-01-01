module.exports = function makeDeletePage({ dataAccess, services, businessLogic, Joi }) {
    return async function deletePage(req, res) {
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

            const existingPage = await dataAccess.getPageWithPermissions(id, userId);
            if (!existingPage) return res.status(404).json({ message: 'Page not found or access denied' });
            if (existingPage.workspace_id !== workspaceId) {
                return res.status(400).json({ message: 'Page does not belong to this workspace' });
            }

            if (!businessLogic.canDelete(existingPage.role)) {
                return res.status(403).json({ message: 'You do not have permission to delete pages' });
            }

            const parentPageId = existingPage.parent_page_id;

            await dataAccess.deletePage(id);
            await services.invalidateAllPageCaches(id, workspaceId, parentPageId);
            await services.publishPageDeleted(id, workspaceId, userId);

            return res.status(204).send();
        } catch (err) {
            console.error('Error deleting page', err);
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