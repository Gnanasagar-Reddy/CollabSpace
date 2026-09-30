const mongoose = require("mongoose");


const documentSchema = new mongoose.Schema({

    title:{
        type:String,
        required:true,
        trim:true
    },


    content:{
        type:String,
        default:""
    },


    versionSequence:{
        type:Number,
        default:0,
        select:false
    },


    yjsState:{
        type:String,
        default:"",
        select:false
    },


    collaborationVersion:{
        type:Number,
        default:0
    },


    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },


    collaborators:[
        {
            user:{
                type:mongoose.Schema.Types.ObjectId,
                ref:"User"
            },


            role:{
                type:String,
                enum:[
                    "viewer",
                    "editor"
                ],
                default:"viewer"
            }
        }
    ]


},{
    timestamps:true
});


module.exports = mongoose.model(
    "Document",
    documentSchema
);
