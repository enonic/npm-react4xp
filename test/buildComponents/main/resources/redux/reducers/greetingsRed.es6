import DuckFactory from "duckfactory";

const greetingsDuck = new DuckFactory(
  "GREETINGS",
  {},
  {
    init: (state, { id, initGreetings }) => ({
      ...state,
      [id]: initGreetings
    }),

    moreGreetees: (state, { id }) => ({
      ...state,
      [id]: {
        ...state[id],
        greeteeCount: state[id].greeteeCount * 2,
        greetee: `${state[id].greetee} ${state[id].greetee}`
      }
    }),

    moreGreetings: (state, { id }) => ({
      ...state,
      [id]: {
        ...state[id],
        greetingsCount: state[id].greetingsCount * 2
      }
    })
  },
  true,
  true
); // eslint-disable-line no-undef
export default greetingsDuck.getReducer();
export const actionCreators = greetingsDuck.getActionCreators();
