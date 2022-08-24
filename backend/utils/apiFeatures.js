class ApiFeatures{
    constructor(query,queryStr){
        this.query = query;
        this.queryStr = queryStr; 
    }
    
    search(){
        const keyword = this.queryStr.keyword ? {
            name: {
                $regex: this.queryStr.keyword,
                $options: 'i'
            }
        } : {};
        this.query = this.query.find({...keyword});
        return this
    }

    filter(){
        const queryCopy = {...this.queryStr}
        // remove some fields
        
        const removeFields = ["keyword","page","limit"];

        removeFields.forEach((key)=>delete queryCopy[key]);
        // filter for price and rating
        let queryStr = JSON.stringify(queryCopy);
        queryStr = queryStr.replace(/\b(gt|gte|lte|lt)\b/g,(key) =>`$${key}`);
        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }

    pagination(resultPerPage){
        const currentPage = Number(this.queryStr.page) || 1;
        const skip = resultPerPage * (currentPage - 1);

        this.query.limit(resultPerPage).skip(skip);
        return this;
    }

    limit(){
        const limit = this.queryStr.limit ? this.queryStr.limit : 100;
        this.query.limit(limit);
        return this;
    }
}

module.exports = ApiFeatures;