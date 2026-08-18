import { useState } from "react";
import api from "../services/api";


function Register(){

    const [form,setForm] = useState({
        name:"",
        email:"",
        password:""
    });


    const handleSubmit = async(e)=>{

        e.preventDefault();


        try{

            const response =
            await api.post(
                "/auth/register",
                form
            );


            console.log(
                response.data
            );


        }catch(error){

            console.log(
                error.response.data
            );

        }

    };


    return(
        <div>

            <h1>
                Register
            </h1>


            <form onSubmit={handleSubmit}>

                <input
                    placeholder="Name"
                    onChange={(e)=>
                        setForm({
                            ...form,
                            name:e.target.value
                        })
                    }
                />


                <input
                    placeholder="Email"
                    onChange={(e)=>
                        setForm({
                            ...form,
                            email:e.target.value
                        })
                    }
                />


                <input
                    placeholder="Password"
                    type="password"
                    onChange={(e)=>
                        setForm({
                            ...form,
                            password:e.target.value
                        })
                    }
                />


                <button>
                    Register
                </button>

            </form>

        </div>
    );
}


export default Register;