import React, {useEffect, useState} from 'react';
import authSvg from '../assets/reset.svg';
import { ToastContainer, toast } from 'react-toastify';
import axios from 'axios';


export default function ResetPassword({match}) {
    const [formData, setFormData] = useState({
        password: '',
        passwordConfirm: '',
        token: ''
    });

    const { password, passwordConfirm, token } = formData;
    useEffect(() => {
        let token = match.params.token;
        if(token){
            setFormData({ ...formData, token })
        }
    }, []);

    const handleChange = text => e => setFormData({ ...formData, [text]: e.target.value });

    const handleSubmit = e => {
        e.preventDefault();
        if((password === passwordConfirm) && passwordConfirm && password){
            axios.put('/api/resetpassword', {
                newPassword: password,
                resetPasswordLink: token
            })
            .then(res => {
                setFormData({ 
                    ...formData,
                    password: "",
                    passwordConfirm: ''
                });
                toast.success(res.data.message);
            })
            .catch(err => {
                toast.error(err.response.data.error);
            })
        } else {
            toast.error('Passwords don\'t match');
        }
    }

    return (
        <div className='min-h-screen bg-gray-100 text-gray-900 flex justify-center'>
            <ToastContainer/>
            <div className='max-w-screen-xl m-0 sm:m-20 bg-white shadow sm:rounded-lg flex justify-center flex-1'>
                <div className='lg:w-1/2 xl:w-5/12 p-6 sm:p-12'>
                    <div className='mt-12 flex flex-col items-center'>
                        <h1 className='text-2xl xl:text-3xl font-extrabold'>
                            Reset Password
                        </h1>
                        <div className='w-full flex-1 mt-8 text-indigo-500'>
                            <form
                                onSubmit={handleSubmit}
                                className='mx-auto max-w-xs relative'
                            >
                                <input
                                    className='w-full px-4 py-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white'
                                    type='password'
                                    placeholder='Password'
                                    onChange={handleChange('password')}
                                    value={password}
                                />
                                <input
                                    className='w-full px-4 py-3 rounded-lg font-medium bg-gray-100 border border-gray-200 placeholder-gray-500 text-sm focus:outline-none focus:border-gray-400 focus:bg-white mt-4'
                                    type='password'
                                    placeholder='Confirm password'
                                    onChange={handleChange('passwordConfirm')}
                                    value={passwordConfirm}
                                />
                                <button
                                    type='submit'
                                    className='mt-8 tracking-wide font-semibold bg-indigo-500 text-gray-100 w-full py-3 rounded-lg hover:bg-indigo-700 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none'
                                >
                                    <i className='fas fa-sign-in-alt  w-6  -ml-2' />
                                    <span className='ml-3'>Submit</span>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
                <div className='flex-1 bg-indigo-100 text-center hidden lg:flex'>
                    <div className='m-12 xl:m-16 w-full bg-contain bg-center bg-no-repeat'>
                        <img src={authSvg} alt='reset-password'/>
                    </div>
                </div>
            </div>
        </div>
    )
}
