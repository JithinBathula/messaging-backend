function getPaginationParams(req) {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 50;
    
    return { page, pageSize };
  }
  
  module.exports = {
    getPaginationParams
  };