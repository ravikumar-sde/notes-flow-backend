module.exports = function makeArchivePage({ dataAccess, services, businessLogic, Joi }) {
    return async function archivePage(req, res) {
        const validationResult = ValidateInput({
            userId: req.headers['x-user-id'],
            workspaceId: req.params.workspaceId,
            id: req.params.id,
            is_archived: req.body.is_archived
        });

        if (validationResult.error) {
            return res.status(400).json({
                message: 'Validation error',
                details: validationResult.error.details.map(d => ({ field: d.path.join('.'), message: d.message }))
            });
        }

        const { userId, workspaceId, id, is_archived } = validationResult.value;

        try {
            const membership = await dataAccess.checkUserWorkspaceAccess(workspaceId, userId);
            if (!membership) return res.status(403).json({ message: 'Access denied to this workspace' });

            const existingPage = await dataAccess.getPageWithPermissions(id, userId);
            if (!existingPage) return res.status(404).json({ message: 'Page not found or access denied' });
            if (existingPage.workspace_id !== workspaceId) {
                return res.status(400).json({ message: 'Page does not belong to this workspace' });
            }

            if (!businessLogic.canArchive(existingPage.role)) {
                return res.status(403).json({ message: 'You do not have permission to archive pages' });
            }

            const page = await dataAccess.archivePage(id, is_archived, userId);
            await services.invalidateAllPageCaches(id, page.workspace_id, page.parent_page_id);
            await services.publishPageArchived(page);

            return res.json({ page });
        } catch (err) {
            console.error('Error archiving page', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };

    function ValidateInput({ userId, workspaceId, id, is_archived }) {
        const schema = Joi.object({
            userId: Joi.string().uuid().required(),
            workspaceId: Joi.string().uuid().required(),
            id: Joi.string().uuid().required(),
            is_archived: Joi.boolean().required()
        });

        return schema.validate({ userId, workspaceId, id, is_archived }, { abortEarly: false });
    }
};