const advancedResults = (model,populate)=>async(req,res,next)=>{
    let query;

    // COPY REQ.QUERY
    const reqQuery = { ...req.query }
  
    // FIELDS TO EXCLUDE
    const removeFields = ['select', 'sort', 'page', 'limit']
  
    // LOOP OVER removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param])
  
    // CREATE QUERY STRING
    let queryStr = JSON.stringify(reqQuery)
  
    // CREATE OPERATORS ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)
  
    // FINDING RESOURCE
    query = model.find(JSON.parse(queryStr));
  
    // SELECT FIELDS
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ')
      query = query.select(fields)
    }
  
    // SORT
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt')
    }
  
    // PAGINATION
    const page = parseInt(req.query.page, 10) || 1;
    console.log(page)
    const limit = parseInt(req.query.limit, 10) || 100;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit
    const total = await model.countDocuments();
  
    query = query.skip(startIndex).limit(limit)
  
    if(populate){
        query = query.populate(populate)
    }

    // EXECUTING QUERY
    const results = await query;
  
    // PAGINATION RESULT
    const pagination = {}
  
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      }
    }
  
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      }
    }

    
    res.advancedResults={
        success: true,
    count: results.length,
    pagination,
    data: results,
    }

    next()
}

module.exports = advancedResults