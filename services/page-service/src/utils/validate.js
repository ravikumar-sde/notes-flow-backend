function validate(schema, req) {
  const { error, value } = schema.validate(
    { headers: req.headers, params: req.params, body: req.body, query: req.query },
    { abortEarly: false }
  );
  
  if (error) {
    return {
      isValid: false,
      error: {
        message: 'Validation error',
        details: error.details.map(d => ({ field: d.path.join('.'), message: d.message }))
      }
    };
  }
  
  return { isValid: true, value };
}

module.exports = { validate };

