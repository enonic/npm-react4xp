import { createStore } from 'redux';

import rootReducer from './reducers';


let store = null;

const getStore = (initialState) => {
    if (store == null) {
        store = createStore(
            rootReducer,
            initialState
        );

        store.subscribe(
            ()=>{ console.log("Store updated:", store.getState()); }
        );
    }
    return store;
};

export default getStore;
