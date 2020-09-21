import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import { isAuth } from '../helpers/auth';
import { signout } from '../helpers/auth';
import { toast } from 'react-toastify';


const AdminRoute = ({history}) => (
    <Route
    render={props =>
        isAuth() ? (
          <div className='min-h-screen bg-gray-100 text-gray-900 flex justify-center'>
            <div className='max-w-screen-xl m-0 sm:m-20 bg-white shadow sm:rounded-lg flex justify-center flex-1'>
                <div className='lg:w-1/2 xl:w-8/12 p-6 sm:p-12'>
                  <div className='mt-12 flex flex-col items-center'>
                    <button
                      onClick={() => {
                        signout(() => {
                          toast.success('Signout successful');
                          history.push('/');
                        });
                      }}
                      className='mt-5 tracking-wide font-semibold bg-pink-500 text-gray-100 w-full py-4 rounded-lg hover:bg-pink-700 transition-all duration-300 ease-in-out flex items-center justify-center focus:shadow-outline focus:outline-none'
                    >
                      <i className='fa fa-sign-out ml-2'/>
                      <span className='ml-3'>Signout</span>
                    </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
            <Redirect
                to={{
                    pathname: '/login',
                    state: { from: props.location }
                }}
            />
        )
    }
    ></Route>
);

export default AdminRoute;