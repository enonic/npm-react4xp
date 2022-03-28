import { combineReducers } from "redux";

import greetingsReducer from "./greetingsRed";

export default combineReducers({
  greetings: greetingsReducer
});
