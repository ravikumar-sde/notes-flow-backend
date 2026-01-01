# Joi Validation Pattern

## Pattern Overview

All controllers now follow this consistent pattern:

### 1. Inject Joi as a dependency
```javascript
module.exports = function makeController({ dataAccess, services, businessLogic, Joi }) {
```

### 2. Create a ValidateInput function inside the controller
```javascript
function ValidateInput({ userId, param1, param2 }) {
    const schema = Joi.object({
        userId: Joi.string().uuid().required(),
        param1: Joi.string().required(),
        param2: Joi.number().min(0)
    });

    return schema.validate({ userId, param1, param2 }, { abortEarly: false });
}
```

### 3. Call ValidateInput at the start of the controller
```javascript
return async function controller(req, res) {
    const validationResult = ValidateInput({
        userId: req.headers['x-user-id'],
        param1: req.params.param1,
        param2: req.body.param2
    });

    if (validationResult.error) {
        return res.status(400).json({
            message: 'Validation error',
            details: validationResult.error.details.map(d => ({ 
                field: d.path.join('.'), 
                message: d.message 
            }))
        });
    }

    const { userId, param1, param2 } = validationResult.value;
    
    // ... rest of controller logic
};
```

### 4. Update index.js to inject Joi
```javascript
const Joi = require('joi');

const makeController = require('./controller');
const controller = makeController({ dataAccess, services, businessLogic, Joi });
```

## Example: getChildPages.js

```javascript
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
                details: validationResult.error.details.map(d => ({ 
                    field: d.path.join('.'), 
                    message: d.message 
                }))
            });
        }

        const { userId, id, workspaceId } = validationResult.value;

        try {
            const membership = await dataAccess.checkUserWorkspaceAccess(workspaceId, userId);
            if (!membership) return res.status(403).json({ message: 'Access denied to this workspace' });

            const page = await dataAccess.getPageWithPermissions(id, userId);
            if (!page) return res.status(404).json({ message: 'Page not found or access denied' });
            if (page.workspace_id !== workspaceId) {
                return res.status(400).json({ message: 'Page does not belong to this workspace' });
            }

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
```

## Benefits

1. **Dependency Injection**: Joi is injected, making testing easier
2. **Separation of Concerns**: Validation logic is separate from business logic
3. **Reusability**: ValidateInput function is scoped to the controller
4. **Consistency**: Same pattern across all controllers
5. **Type Safety**: All inputs validated before use
6. **Clear Error Messages**: Structured validation errors

