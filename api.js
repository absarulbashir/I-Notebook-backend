const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const { MongoClient, ServerApiVersion } = require('mongodb');
var bcrypt = require('bcryptjs');
require('dotenv').config();

const app = express();
app. use(bodyParser.urlencoded());
app.use(bodyParser.json());

var cors=require("cors");
app.use(cors());

const client = new MongoClient(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect().catch(()=>{
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
}).then(()=>{
    console.log("connected");
})

const db = client.db("MERN");
const collection=db.collection("users");


const getDoc=async()=>{
    const docs = collection.find({},{});
    let doc=(await docs.toArray());
    return doc;
}
getDoc();

//SETTING LOGIN ENDPOINT....
app.post("/api/auth/login",(req,res)=>{
    const {email,password}=req.body;
    collection.findOne({email}).then(async(value)=>{
        if(value===null){
            res.json({
                error:"No user found"
            })
        }
        else{
            let docs = await getDoc();
            let match=docs.filter((el)=>{
                let isMatch=bcrypt.compareSync(password,el.password);
                if(isMatch){
                    return el;
                }
            })

            if(match.length===0){
                res.json({
                    error:"No user found"
                })
            }
            else{
                res.json({
                    email:value.email,
                    name:value.name,
                    data:value.data
                })
            }
        }
    })
});
//FINISH LOGIN...


//SETTING SIGNUP ENDPOINT...
app.post("/api/auth/signup",(req,res)=>{
    const {name,email,password,data}=req.body;
    collection.findOne({email:email},)
    .then(async(value)=>{
        if(value===null){
            let docs = await getDoc();
            let match=docs.filter((el)=>{
                console.log(docs);
                let isMatch=bcrypt.compareSync(password,el.password);
                if(isMatch){
                    return el;
                }
            })

            if(match.length===1){
                res.json({
                    error:"A user with this email or password already exists"
                })
            }
            else{
                let salt = bcrypt.genSaltSync(10);
                let hash = bcrypt.hashSync(password,salt);

               collection.insertOne({
                name,
                email,
                password:hash,
                data:[]
               });

               res.json({
                name,
                email,
                data
               })
            }
        }
        else{
            res.json({
                error:"A user with this email or pasword already exists"
            })
        }
    })  
        
});
//FINISH SIGNUP...


//ADDING NOTE

app.post("/api/auth/addnote",(req,res)=>{

    const {title,description,email,password} = req.body;
    let date_ob = new Date();

// current date
// adjust 0 before single digit date
let date = ("0" + date_ob.getDate()).slice(-2);

// current month
let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

// current year
let year = date_ob.getFullYear();
    collection.findOne({email}).then((value)=>{
        let Data=value.data;
        Data=Data.concat([{title:title,description:description,date:`${date}/${month}/${year}`}]);
        collection.updateOne({email:email},{
            $set:{
                data:Data
            }
        }).then(()=>{
            res.json({
                data:Data
            })
        }).catch((err)=>{
           res.json({
            error:err
           });
        })
    });

});



//DELETING A NOTE

app.post("/api/auth/deletenote",(req,res)=>{
    const {email,password,index} = req.body;

    collection.findOne({email:email}).then((value)=>{
        let Data = value.data;
        Data.splice(index,1);
        collection.updateOne({email:email},{
            $set:{
                data:Data
            }
        }).then(()=>{
            res.json({
                data:Data
            })
        }).catch((err)=>{
            res.json({
                error:err
            });
        })
    });
});
//END DELETE ...



//Listening to the port 4000...
app.listen(process.env.PORT||5000,()=>{
    console.log("Listening at port 5000");
})