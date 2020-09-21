import cookie from 'js-cookie';


// Get the cookie
export const getCookie = key => {
    if(window !== 'undefined') {
        return cookie.get(key);
    }
}

// Set the cookie
export const setCookie = (key, value) => {
    if(window !== 'undefined') {
        cookie.set(key, value, {expires: 1})
    }
}

// Set the local storage
export const setLocalStorage = (key, value) => {
    if(window !== 'undefined') {
        localStorage.setItem(key, JSON.stringify(value))
    }
}

// authenticate the user
export const authenticate = (response, next) => {
    setCookie('token', response.data.token)
    setLocalStorage('user', response.data.user);
    next();
}

// Get info about user
export const isAuth = () => {
    if(window !== 'undefined') {
        const cookieChecked = getCookie('token');
        if(cookieChecked) {
            if(localStorage.getItem('user')) {
                return JSON.parse(localStorage.getItem('user'));
            } else {
                return false;
            }
        }
    }
}

// updata user data
export const updateUser = (response, next) => {
    if(window !== 'undefined') {
        let auth = JSON.parse(localStorage.getItem('user'));
        auth = response.data;
        localStorage.setItem('user', JSON.stringify(auth))
    }
    next();
}

// remove the cookie
export const removeCookie = key => {
    if(window !== 'undefined') {
        cookie.remove(key, {expires: 1})
    }
}

// remove local storage
export const removeLocalStorage = key => {
    if(window !== 'undefined') {
        localStorage.removeItem(key)
    }
}

// signout
export const signout = next => {
    removeCookie('token')
    removeLocalStorage('user');
    next();
}