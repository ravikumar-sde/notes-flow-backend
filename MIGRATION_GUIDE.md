# Migration Guide: Joi Validation Refactoring

## Overview
This guide explains how to apply the new Joi validation pattern to any controller.

## Step-by-Step Migration

### Step 1: Update the Controller Factory Function

**Before:**
```javascript
module.exports = function makeController({ dataAccess, services, businessLogic }) {
```

**After:**
```javascript
module.exports = function makeController({ dataAccess, services, businessLogic, Joi }) {
```

### Step 2: Remove Inline Joi Require

**Before:**
```javascript
return async function controller(req, res) {
    const Joi = require('joi');  // ❌ Remove this
```

**After:**
```javascript
return async function controller(req, res) {
    // Joi is now available from the closure
```

### Step 3: Create ValidateInput Function

Add this function at the end of your controller (before the closing `};`):

```javascript
function ValidateInput({ param1, param2, ... }) {
    const schema = Joi.object({
        param1: Joi.string().required(),
        param2: Joi.number().min(0),
        // ... all your validation rules
    });

    return schema.validate({ param1, param2, ... }, { abortEarly: false });
}
```

### Step 4: Replace Validation Logic

**Before:**
```javascript
const schema = Joi.object({
    headers: Joi.object({
        'x-user-id': Joi.string().uuid().required()
    }).unknown(true),
    params: Joi.object({
        id: Joi.string().uuid().required()
    }),
    body: Joi.object({
        name: Joi.string().required()
    })
});

const { error, value } = schema.validate({ 
    headers: req.headers, 
    params: req.params, 
    body: req.body 
}, { abortEarly: false });

if (error) {
    return res.status(400).json({
        message: 'Validation error',
        details: error.details.map(d => ({ 
            field: d.path.join('.'), 
            message: d.message 
        }))
    });
}

const userId = value.headers['x-user-id'];
const { id } = value.params;
const { name } = value.body;
```

**After:**
```javascript
const validationResult = ValidateInput({
    userId: req.headers['x-user-id'],
    id: req.params.id,
    name: req.body.name
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

const { userId, id, name } = validationResult.value;
```

### Step 5: Update index.js

**Before:**
```javascript
const makeController = require('./controller');
const controller = makeController({ dataAccess, services, businessLogic });
```

**After:**
```javascript
const Joi = require('joi');  // Add this at the top

const makeController = require('./controller');
const controller = makeController({ dataAccess, services, businessLogic, Joi });
```

## Complete Example

### Before
```javascript
module.exports = function makeCreateUser({ dataAccess, services }) {
  return async function createUser(req, res) {
    const Joi = require('joi');
    
    const schema = Joi.object({
      headers: Joi.object({
        'x-user-id': Joi.string().uuid().required()
      }).unknown(true),
      body: Joi.object({
        email: Joi.string().email().required(),
        name: Joi.string().min(1).max(100).required()
      })
    });

    const { error, value } = schema.validate({ 
      headers: req.headers, 
      body: req.body 
    }, { abortEarly: false });
    
    if (error) {
      return res.status(400).json({ 
        message: 'Validation error', 
        details: error.details.map(d => ({ 
          field: d.path.join('.'), 
          message: d.message 
        }))
      });
    }

    const userId = value.headers['x-user-id'];
    const { email, name } = value.body;

    try {
      const user = await dataAccess.createUser({ email, name, createdBy: userId });
      return res.status(201).json({ user });
    } catch (err) {
      console.error('Error creating user', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};
```

### After
```javascript
module.exports = function makeCreateUser({ dataAccess, services, Joi }) {
  return async function createUser(req, res) {
    const validationResult = ValidateInput({
      userId: req.headers['x-user-id'],
      email: req.body.email,
      name: req.body.name
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

    const { userId, email, name } = validationResult.value;

    try {
      const user = await dataAccess.createUser({ email, name, createdBy: userId });
      return res.status(201).json({ user });
    } catch (err) {
      console.error('Error creating user', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };

  function ValidateInput({ userId, email, name }) {
    const schema = Joi.object({
      userId: Joi.string().uuid().required(),
      email: Joi.string().email().required(),
      name: Joi.string().min(1).max(100).required()
    });

    return schema.validate({ userId, email, name }, { abortEarly: false });
  }
};
```

## Checklist

- [ ] Add `Joi` parameter to factory function
- [ ] Remove inline `const Joi = require('joi')`
- [ ] Create `ValidateInput` function
- [ ] Update validation call to use `ValidateInput`
- [ ] Flatten nested validation structure
- [ ] Update `index.js` to inject Joi
- [ ] Test the controller
- [ ] Verify syntax with `node -c <file>`

## Benefits Recap

✅ **Performance**: Joi loaded once at startup instead of on every request
✅ **Testability**: Joi can be mocked in tests
✅ **Maintainability**: Consistent pattern across all controllers
✅ **Readability**: Clearer separation of validation and business logic

