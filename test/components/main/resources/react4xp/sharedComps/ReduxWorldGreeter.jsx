/* eslint-disable import/no-unresolved */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/prop-types */
import React from "react";
import { connect } from "react-redux";

import { actionCreators as testAC } from "../../redux/reducers/greetingsRed";

const ReduxWorldGreeter = ({
  id,
  greetingsCount,
  greetee,
  moreGreetings,
  moreGreetees
}) => {
  let greetings = "";
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < greetingsCount; i++) {
    greetings += "hello ";
  }
  greetings = greetings.charAt(0).toUpperCase() + greetings.substr(1);

  return (
    <div className="worldGreeter">
      <h1>
        <span
          onClick={() => moreGreetings(id)}
          style={{ cursor: "pointer" }}
          className="greetee"
        >
          {greetings}
        </span>
        <span
          onClick={() => moreGreetees(id)}
          style={{ cursor: "pointer" }}
          className="greetee"
        >
          {greetee}
        </span>
      </h1>
    </div>
  );
};

const mapStateToProps = (state, ownprops) => ({
  id: ownprops.id,
  greetingsCount: state.greetings[ownprops.id].greetingsCount,
  greetee: state.greetings[ownprops.id].greetee
});

const mapDispatchToProps = {
  moreGreetings: testAC.moreGreetings,
  moreGreetees: testAC.moreGreetees
};

// ----------------------------------------------  Export

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ReduxWorldGreeter);
