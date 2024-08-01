const NewBulkProduct= require('../models/NewBulkProduct');
const bulkproduct=require('../models/bulkproduct')


const addBulkdetails= async(req, res)=>{

    const{ProductName,BulkCode,quantity,VehicleNo,DriverName,DriverId,InsertedDate}= req.body;

    try {

        const existingBulk= await bulkproduct.findOne({bulkCode:BulkCode})

        if(existingBulk){
            existingBulk.quantity= parseFloat(existingBulk.quantity) + parseFloat(quantity);
            await existingBulk.save();
        }

        const newBulk= new NewBulkProduct({
            ProductName,
            BulkCode,
            quantity,
            VehicleNo,
            DriverName,
            DriverId,
            InsertedDate,    
        })

        const savedNewBulkproduct= await newBulk.save();
        res.status(201).json('Created successfully');

        
    } catch (error) {
        res.status(500).json({message:'server error'});
        console.log(error);
        
    }

};


const getAllbulk=async(req,res)=>{
    try {

        const getalldetails= await NewBulkProduct.find();
        res.status(200).json(getalldetails);
        
    } catch (error) {

        res.status(500).json('server error')
        console.log(error)
        
    }

}


module.exports={
    addBulkdetails,
    getAllbulk

}