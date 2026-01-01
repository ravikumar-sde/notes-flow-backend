module.exports = function makeMovePage({ dataAccess, services, businessLogic, Joi }) {
    return async function movePage(req, res) {
        const validationResult = ValidateInput({
            userId: req.headers['x-user-id'],
            workspaceId: req.params.workspaceId,
            id: req.params.id,
            parent_page_id: req.body.parent_page_id,
            position: req.body.position
        });

        if (validationResult.error) {
            return res.status(400).json({
                message: 'Validation error',
                details: validationResult.error.details.map(d => ({ field: d.path.join('.'), message: d.message }))
            });
        }

        const { userId, workspaceId, id, parent_page_id, position } = validationResult.value;

        try {
            const membership = await dataAccess.checkUserWorkspaceAccess(workspaceId, userId);
            if (!membership) return res.status(403).json({ message: 'Access denied to this workspace' });

            const existingPage = await dataAccess.getPageWithPermissions(id, userId);
            if (!existingPage) return res.status(404).json({ message: 'Page not found or access denied' });
            if (existingPage.workspace_id !== workspaceId) {
                return res.status(400).json({ message: 'Page does not belong to this workspace' });
            }

            if (!businessLogic.canMove(existingPage.role)) {
                return res.status(403).json({ message: 'You do not have permission to move pages' });
            }

            const oldParentId = existingPage.parent_page_id;

            if (parent_page_id) {
                const newParent = await dataAccess.getPageById(parent_page_id);
                if (!newParent) return res.status(404).json({ message: 'New parent page not found' });
                if (newParent.workspace_id !== workspaceId) {
                    return res.status(400).json({ message: 'Cannot move page to different workspace' });
                }
            }

            const newPosition = position !== undefined
                ? position
                : await businessLogic.calculateNewPosition(workspaceId, parent_page_id || null);

            const page = await dataAccess.movePage(id, parent_page_id || null, newPosition, userId);

            await services.invalidateWorkspaceCache(page.workspace_id);
            if (oldParentId) await services.invalidateChildPagesCache(oldParentId);
            if (parent_page_id) await services.invalidateChildPagesCache(parent_page_id);

            await services.publishPageMoved(page, oldParentId);

            return res.json({ page });
        } catch (err) {
            console.error('Error moving page', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };

    function ValidateInput({ userId, workspaceId, id, parent_page_id, position }) {
        const schema = Joi.object({
            userId: Joi.string().uuid().required(),
            workspaceId: Joi.string().uuid().required(),
            id: Joi.string().uuid().required(),
            parent_page_id: Joi.string().uuid().allow(null),
            position: Joi.number().integer().min(0)
        });

        return schema.validate({ userId, workspaceId, id, parent_page_id, position }, { abortEarly: false });
    }
};