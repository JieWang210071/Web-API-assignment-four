import actionTypes from '../constants/actionTypes';
import runtimeEnv from '@mars/heroku-js-runtime-env';

function moviesFetched(movies){
    return {
        type: actionTypes.FETCH_MOVIES,
        movies: movies
    }
}

function movieFetched(movie){
    return {
        type: actionTypes.FETCH_MOVIE,
        selectedMovie: movie
    }
}

function movieSet(movie){
    return {
        type: actionTypes.SET_MOVIE,
        selectedMovie: movie
    }
}

export function setMovie(movie) {
    return dispatch => {
        dispatch(movieSet(movie));
    }
}

export function submitReview(data){
    return dispatch => {
        return fetch('api/savemoviereview', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-access-token': localStorage.getItem('token')
            },
            body: JSON.stringify(data),
            mode: 'cors'})
            .then( (response) => {
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.json();
            })
            .then( (res) => {
                // dispatch(fetchMovie(data.title));
                // if (res.success) {
                //     dispatch(submitLogin(data));
                // }
            })
            .catch( (e) => console.log(e) );
    }
}

export function fetchMovies(){
    const env = runtimeEnv();
    return dispatch => {
        return fetch('api/getallmovie?reviews=true', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-access-token': localStorage.getItem('token')
            },
            mode: 'cors'})
            .then( (response) => {
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.json();
            })
            .then( (res) => {
                if (res.success === undefined) {
                    dispatch(moviesFetched(res));
                }
            })
            .catch( (e) => console.log(e) );
    }
}

export function fetchMovie(movieTitle){
    const env = runtimeEnv();
    return dispatch => {
        return fetch(`api/getmovie?title=${movieTitle}?reviews=true`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-access-token': localStorage.getItem('token')
            },
            mode: 'cors'})
            .then( (response) => {
                if (!response.ok) {
                    throw Error(response.statusText);
                }
                return response.json();
            })
            .then( (res) => {
                dispatch(movieFetched(res));
            })
            .catch( (e) => console.log(e) );
    }
}