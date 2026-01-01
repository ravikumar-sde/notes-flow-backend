module.exports = function makeUpdatePage({ dataAccess, services, businessLogic, Joi }) {
  return async function updatePage(req, res) {
    const validationResult = ValidateInput({
      userId: req.headers['x-user-id'],
      workspaceId: req.params.workspaceId,
      id: req.params.id,
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

    const { userId, workspaceId, id, title, content, icon, cover_image } = validationResult.value;

    try {
      const membership = await dataAccess.checkUserWorkspaceAccess(workspaceId, userId);
      if (!membership) return res.status(403).json({ message: 'Access denied to this workspace' });

      const existingPage = await dataAccess.getPageWithPermissions(id, userId);
      if (!existingPage) return res.status(404).json({ message: 'Page not found or access denied' });
      if (existingPage.workspace_id !== workspaceId) {
        return res.status(400).json({ message: 'Page does not belong to this workspace' });
      }

      if (!businessLogic.canEdit(existingPage.role)) {
        return res.status(403).json({ message: 'You do not have permission to edit pages' });
      }

      const updates = {};
      if (title !== undefined) updates.title = title;
      if (content !== undefined) updates.content = content;
      if (icon !== undefined) updates.icon = icon;
      if (cover_image !== undefined) updates.cover_image = cover_image;

      const page = await dataAccess.updatePage(id, updates, userId);
      await services.invalidateAllPageCaches(id, page.workspace_id, page.parent_page_id);
      await services.publishPageUpdated(page);

      return res.json({ page });
    } catch (err) {
      console.error('Error updating page', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  function ValidateInput({ userId, workspaceId, id, title, content, icon, cover_image }) {
    const schema = Joi.object({
      userId: Joi.string().uuid().required(),
      workspaceId: Joi.string().uuid().required(),
      id: Joi.string().uuid().required(),
      title: Joi.string().max(255),
      content: Joi.object(),
      icon: Joi.string().max(100).allow(null),
      cover_image: Joi.string().uri().allow(null)
    }).min(4); // At least userId, workspaceId, id, and one update field

    return schema.validate({ userId, workspaceId, id, title, content, icon, cover_image }, { abortEarly: false });
  }
};