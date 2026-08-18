import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";


function Login(){

    const navigate = useNavigate();

    const { login } =
        useContext(AuthContext);


    const [form,setForm] = useState({
        email:"",
        password:""
    });


    const [message,setMessage] =
        useState("");


    const handleSubmit = async(e)=>{

        e.preventDefault();


        try{

            const response =
            await api.post(
                "/auth/login",
                form
            );


            console.log(
                response.data
            );


            const {
                user,
                accessToken
            } = response.data.data;


            login(
                user,
                accessToken
            );


            navigate("/dashboard");


        }catch(error){

            console.log(
                error.response.data
            );


            setMessage(
                error.response.data.message
            );

        }

    };


    return(

        <div>

            <h1>
                Login
            </h1>


            <form onSubmit={handleSubmit}>


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
                    Login
                </button>


            </form>


            <p>
                {message}
            </p>


        </div>

    );

}


export default Login;