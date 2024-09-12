const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err)=> next(err))
    }
}

export { asyncHandler }











// const asyncHandler = () => {} 
// const asyncHandler = (func) => {()=> {}} // this is a higher function which takes another function as parameter
// const asyncHandler = (func) => async () => {}

// const asyncHandler = (func) => async (req, res, next) => { // this is the try catch method 
//     try {
//         await func(req, res, next)
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
//     }
// }