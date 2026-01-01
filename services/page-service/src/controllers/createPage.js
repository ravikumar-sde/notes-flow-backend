module.exports = function makeCreatePage({ dataAccess, services, businessLogic, Joi }) {
  return async function createPage(req, res) {
    const validationResult = ValidateInput({
      userId: req.headers['x-user-id'],
      workspaceId: req.params.workspaceId || req.body.workspace_id,
      parent_page_id: req.body.parent_page_id,
      title: req.body.title,
      content: req.body.content,
      icon: req.body.icon,
      cover_image: req.body.cover_image
    });

    if (validationResult.error) {
      return res.status(400).json({
        message: 'Validation error',
        details: validationResult.error.details.map(d => ({ field: d.path.join('.'), message: d.message }))
      });
    }

    const { userId, workspaceId, parent_page_id, title, content, icon, cover_image } = validationResult.value;

    try {
      const membership = await dataAccess.checkUserWorkspaceAccess(workspaceId, userId);
      if (!membership) return res.status(403).json({ message: 'Access denied to this workspace' });

      if (!businessLogic.canEdit(membership.role)) {
        return res.status(403).json({ message: 'You do not have permission to create pages in this workspace' });
      }

      if (parent_page_id) {
        const parentPage = await dataAccess.getPageById(parent_page_id);
        if (!parentPage) return res.status(404).json({ message: 'Parent page not found' });
        if (parentPage.workspace_id !== workspaceId) {
          return res.status(400).json({ message: 'Parent page does not belong to this workspace' });
        }
      }

      const position = await businessLogic.calculateNewPosition(workspaceId, parent_page_id || null);
      const page = await dataAccess.createPage(workspaceId, parent_page_id || null, title, content, icon, cover_image, userId);
      await dataAccess.movePage(page.id, parent_page_id || null, position, userId);
      await services.invalidateWorkspaceCache(workspaceId);
      if (parent_page_id) await services.invalidateChildPagesCache(parent_page_id);
      await services.publishPageCreated(page);

      return res.status(201).json({ page });
    } catch (err) {
      console.error('Error creating page', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  function ValidateInput({ userId, workspaceId, parent_page_id, title, content, icon, cover_image }) {
    const schema = Joi.object({
      userId: Joi.string().uuid().required(),
      workspaceId: Joi.string().uuid().required(),
      parent_page_id: Joi.string().uuid().allow(null),
      title: Joi.string().max(255).default('Untitled'),
      content: Joi.object().default({ blocks: [] }),
      icon: Joi.string().max(100).allow(null),
      cover_image: Joi.string().uri().allow(null)
    });

    return schema.validate({ userId, workspaceId, parent_page_id, title, content, icon, cover_image }, { abortEarly: false });
  }
};