import React, { useState } from 'react';
import authSvg from '../assets/auth.svg';
import { ToastContainer, toast } from 'react-toastify';
import { authenticate, isAuth } from '../helpers/auth';
import axios from 'axios';
import { Redirect } from 'react-router-dom';


export default function Register() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        passwordConfirm: ""
    })

    const {name, email, password, passwordConfirm} = formData;

    const handleChange = text => e => setFormData({...formData, [text]: e.target.value});

    //Submit data to server
    const handleSubmit = e => {
        e.preventDefault();
        if(name && email && password) { 
            if(password === passwordConfirm){
                axios.post('/api/register', {name ,email ,password})
                    .then(res => {
                        setFormData({
                            ...formData,
                            name: "",
                            email: "",
                            password: "",
                            passwordConfirm: ""
                        })
                        toast.success(res.data.message);
                    })
                    .catch(err => {
                        toast.error(err.response.data.error)
                    }) 
            } else {
                toast.error('Passwords do not match');
            }
        } else {
            toast.error('Please fill all fields');
        }

    }

    return (
        <div className='min-h-screen bg-gray-100 text-gray-900 flex justify-center'>
            {isAuth() ? <Redirect to='/'/> : null}
            <ToastContainer/>
            <div className='max-w-screen-xl m-0 sm:m-20 bg-white shadow sm:rounded-lg flex justify-center flex-1'>
                <div className='lg:w-1/2 xl:w-5/12 p-6 sm:p-12'>
                    <div className='mt-12 flex flex-col items-center'>
                        <h1 className='text-2xl xl:text-3xl font-extrabold'>
                            Sign Up
                        </h1>
                        <form className="w-full flex-1 mt-8 text-indigo-500" onSubmit={handleSubmit}>
                            <div className="mx-auto max-w-xs relative">
                                <input
                                    type='text'
                                    placeholder='Name'
                                    value={name}
                                    onChange={handleChange('name')}
                                    className='w-full px-5 py-2 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:bg-white'
                                />
                                <input
                                    type='email'
                                    placeholder='Email'
                                    value={email}
                                    onChange={handleChange('email')}
                                    className='w-full px-5 py-2 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:bg-white mt-4'
                                />
                                <input
                                    type='password'
                                    placeholder='Password'
                                    value={password}
                                    onChange={handleChange('password')}
                                    className='w-full px-5 py-2 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:bg-white mt-4'
                                />
                                <input
                                    type='password'
                                    placeholder='Confirm password'
                                    value={passwordConfirm}
                                    onChange={handleChange('passwordConfirm')}
                                    className='w-full px-5 py-2 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:bg-white mt-4'
                                />
                                <button 
                                    type='submit'
                                    className='mt-6 tracking-wide font-semibold bg-indigo-500 text-gray-100 w-full py-3 rounded-lg hover:bg-indigo-700'
                                >
                                    Register
                                </button>
                            </div>
                            <div className="my-12 border-b text-center">
                                <div className="leading-none px-2 inline-block text-sm text-gray-600 tracking-wide font-medium bg-white transform translate-y-1/2">
                                    Sign with email or social media
                                </div>
                            </div>
                            <div className="flex flex-col items-center">
                                <a 
                                    href="/login"
                                    className='w-full max-w-xs font-bold shadow-sm rounded-lg py-3 bg-indigo-100 text-gray-800 flex items-center justify-center transition-all duration-300 ease-in-out focus:outline-none hover:shadow focus:shadow-sm focus:shadow-outline mt-5'
                                >Sign in</a>
                            </div>
                        </form>
                    </div>
                </div>
                <div className="flex-1 bg-indigo-100 text-center hidden lg:flex">
                    <div className="m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat">
                        <img src={authSvg}/>
                    </div>
                </div>
            </div>
        </div>
    )
}
