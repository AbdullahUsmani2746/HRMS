
import mongoose from "mongoose";

// Pay Schedule Setup Model
const AllownceSchema = new mongoose.Schema({
    allownce: {
    type: String,
    required: true,
    maxlength: 150
  },

  allownce_description: {
    type: String,
    required: true,
    maxlength: 150
  },
  
  rate: {
    type: String,
    required: true,
    maxlength: 150
  },

  employerId:{
    type: String,
    required: true,
    maxlength: 12
  }

});

 const Allownce = mongoose.models.Allownce || mongoose.model('Allownce', AllownceSchema);
export default Allownce;