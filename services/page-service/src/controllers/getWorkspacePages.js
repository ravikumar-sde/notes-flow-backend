module.exports = function makeGetWorkspacePages({ dataAccess, services, businessLogic, Joi }) {
    return async function getWorkspacePages(req, res) {
        const validationResult = ValidateInput({
            userId: req.headers['x-user-id'],
            workspaceId: req.params.workspaceId
        });

        if (validationResult.error) {
            return res.status(400).json({
                message: 'Validation error',
                details: validationResult.error.details.map(d => ({ field: d.path.join('.'), message: d.message }))
            });
        }

        const { userId, workspaceId } = validationResult.value;

        try {
            const membership = await dataAccess.checkUserWorkspaceAccess(workspaceId, userId);
            if (!membership) return res.status(403).json({ message: 'Access denied to this workspace' });

            const cached = await services.getCachedWorkspacePages(workspaceId);
            if (cached) return res.json({ pages: buildPageTree(cached), source: 'cache' });

            const pages = await dataAccess.getWorkspacePages(workspaceId, userId);
            await services.setCachedWorkspacePages(workspaceId, pages);

            const tree = buildPageTree(pages);

            return res.json({ pages: tree, source: 'db' });
        } catch (err) {
            console.error('Error getting workspace pages', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
    };

    function ValidateInput({ userId, workspaceId }) {
        const schema = Joi.object({
            userId: Joi.string().uuid().required(),
            workspaceId: Joi.string().uuid().required()
        });

        return schema.validate({ userId, workspaceId }, { abortEarly: false });
    }

    function buildPageTree(pages) {
        const pageMap = new Map();
        const rootPages = [];

        // Create a map of all pages
        pages.forEach(page => {
            pageMap.set(page.id, { ...page, children: [] });
        });

        // Build the tree
        pages.forEach(page => {
            const pageNode = pageMap.get(page.id);
            if (page.parent_page_id === null) {
                rootPages.push(pageNode);
            } else {
                const parent = pageMap.get(page.parent_page_id);
                if (parent) {
                    parent.children.push(pageNode);
                }
            }
        });

        return rootPages;
    }
}