import React from "react";
import ToggleSwitch from "../../extra/ToggleSwitch";

const SettingBox = (props) => {
  const { title, title2,toggleSwitch } = props;

  return (
    <>
      <div className="col-xl-6 col-12 mt-4">
        <div className="settingBox">
          <div className="settingBoxHeader boxBetween">
            <div className="mainTitle w-100">{title}</div>
            
            {toggleSwitch && (
              <div className="titleBtn boxBetween" >
                <span className="me-2 fw-semibold">{toggleSwitch.switchName}</span>
                <span>
                  <ToggleSwitch
                    value={toggleSwitch.switchValue}
                    onClick={toggleSwitch.handleClick}
                  />
                </span>
              </div>
            )}
          </div>
          <span className="h5 d-block w-100"
          style={{
            color : "#5a5a5a",
            fontSize : "15px"
            
          }}
          >{title2}</span>
          <div className="settingInnerBox" >
            <div className="row">{props.children}</div>
          </div>
          <div className="settingFooter text-end" >
          
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingBox;
