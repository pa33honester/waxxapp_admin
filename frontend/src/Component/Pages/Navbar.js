import { useNavigate } from "react-router-dom";
import profile from "../../assets/images/g-7.png";
import Setting2 from "../../assets/images/Setting3.png";

import { connect, useDispatch, useSelector } from "react-redux";

import { OPEN_DIALOGUE } from "../store/dialogue/dialogue.type";
import Notification from "../Table/admin/Notification";

const Navbar = (props) => {
  const admin = useSelector((state) => state.admin.admin);
  const { dialogue, dialogueType, dialogueData } = useSelector(
    (state) => state.dialogue
  );

  const navigate = useNavigate();
  const dispatch = useDispatch();

  return (
    <>
      <div className="mainNavbar webNav">
        <div
          className="navBar boxBetween px-4"
          style={{ padding: "5px 0px 5px 0px" , background : "#fff" ,
            borderBottom : "1px solid white",
            borderRadius : "5px",
          
           }}
        >
          <div className="navToggle d-flex  fs-4">
            <i class="bi bi-list"
            style={{
              color : "#000"
            }}
            ></i>
          </div>
          <div className="navIcons boxBetween" >
            <div className="" style={{paddingRight : "18px"}} onClick={() => navigate("/admin/setting")}>
              <img
                src={Setting2}
                alt=""
                style={{ width: "25px", height: "25px" }}
              />
            </div>
            <div
              className="pe-4 "
              onClick={() => {
                dispatch({
                  type: OPEN_DIALOGUE,
                  payload: { type: "Notification" },
                });
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="33"
                viewBox="0 0 33 35"
                fill="none"
              >
                <g clip-path="url(#clip0_347_385)">
                  <path
                    d="M16.782 31.7744C18.2589 31.7744 19.4673 30.4745 19.4673 28.8858H14.0966C14.0966 30.4745 15.305 31.7744 16.782 31.7744ZM24.838 23.1087V15.8872C24.838 11.4533 22.6495 7.74144 18.796 6.75932V5.77721C18.796 4.57845 17.8964 3.61078 16.782 3.61078C15.6676 3.61078 14.768 4.57845 14.768 5.77721V6.75932C10.9279 7.74144 8.72593 11.4388 8.72593 15.8872V23.1087L6.04058 25.9972V27.4415H27.5234V25.9972L24.838 23.1087ZM22.1527 24.5529H11.4113V15.8872C11.4113 12.3054 13.4387 9.38793 16.782 9.38793C20.1252 9.38793 22.1527 12.3054 22.1527 15.8872V24.5529ZM10.8474 5.89275L8.92733 3.82742C5.70491 6.47047 3.58348 10.5434 3.39551 15.1651H6.08086C6.28226 11.3377 8.1083 7.98697 10.8474 5.89275ZM27.4831 15.1651H30.1684C29.967 10.5434 27.8456 6.47047 24.6366 3.82742L22.73 5.89275C25.4422 7.98697 27.2817 11.3377 27.4831 15.1651Z"
                    fill="#000"
                    stroke="#fff"
                    stroke-width="0.5"
                  />  
                </g>
                <defs>
                  <clipPath id="clip0_347_385">
                    <rect
                      width="32.2242"
                      height="34.6629"
                      fill="white"
                      transform="translate(0.669922)"
                    />
                  </clipPath>
                </defs>
              </svg>
            </div>
            <div
              className="pe-3 adminImageBorder"
              onClick={() => navigate("/admin/profilePage")}
            >
              <img
                src={admin?.image}
                alt=""
                className="adminImage"
                width={`25px`}
                style={{ borderRadius: "50%" }}
                onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/dummy.png";
                      }}
              />
              <div className="">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="42"
                  height="44"
                  viewBox="0 0 55 57"
                  fill="none"
                >
                  <mask id="path-1-inside-1_347_381" fill="white">
                    <path d="M5.71233 44.711C8.36851 48.7634 11.975 52.02 16.1799 54.163C20.3848 56.306 25.0444 57.2622 29.704 56.9384C34.3636 56.6145 38.8641 55.0216 42.7662 52.3151C46.6683 49.6086 49.8387 45.881 51.9681 41.496C54.0975 37.111 55.1131 32.2185 54.9158 27.2958C54.7185 22.3732 53.315 17.5885 50.8424 13.4089C48.3697 9.22927 44.9123 5.79739 40.8075 3.44817C36.7028 1.09894 32.0909 -0.0873647 27.422 0.0050093L27.4484 1.49086C31.8739 1.4033 36.2453 2.52775 40.136 4.75448C44.0267 6.9812 47.3038 10.2341 49.6475 14.1958C51.9913 18.1575 53.3215 22.6926 53.5086 27.3586C53.6956 32.0246 52.7329 36.662 50.7146 40.8183C48.6962 44.9747 45.6911 48.5079 41.9925 51.0733C38.2938 53.6386 34.0281 55.1485 29.6114 55.4555C25.1948 55.7624 20.7781 54.8561 16.7925 52.8248C12.8069 50.7935 9.38844 47.7068 6.87077 43.8657L5.71233 44.711Z" />
                  </mask>
                  <path
                    d="M5.71233 44.711C8.36851 48.7634 11.975 52.02 16.1799 54.163C20.3848 56.306 25.0444 57.2622 29.704 56.9384C34.3636 56.6145 38.8641 55.0216 42.7662 52.3151C46.6683 49.6086 49.8387 45.881 51.9681 41.496C54.0975 37.111 55.1131 32.2185 54.9158 27.2958C54.7185 22.3732 53.315 17.5885 50.8424 13.4089C48.3697 9.22927 44.9123 5.79739 40.8075 3.44817C36.7028 1.09894 32.0909 -0.0873647 27.422 0.0050093L27.4484 1.49086C31.8739 1.4033 36.2453 2.52775 40.136 4.75448C44.0267 6.9812 47.3038 10.2341 49.6475 14.1958C51.9913 18.1575 53.3215 22.6926 53.5086 27.3586C53.6956 32.0246 52.7329 36.662 50.7146 40.8183C48.6962 44.9747 45.6911 48.5079 41.9925 51.0733C38.2938 53.6386 34.0281 55.1485 29.6114 55.4555C25.1948 55.7624 20.7781 54.8561 16.7925 52.8248C12.8069 50.7935 9.38844 47.7068 6.87077 43.8657L5.71233 44.711Z"
                    fill="#B93160"
                    stroke="#B93160"
                    stroke-width="6"
                    mask="url(#path-1-inside-1_347_381)"
                  />
                  <path
                    d="M50.6488 28.5C50.6488 41.7804 40.4516 52.5 27.9284 52.5C15.4052 52.5 5.20801 41.7804 5.20801 28.5C5.20801 15.2196 15.4052 4.5 27.9284 4.5C40.4516 4.5 50.6488 15.2196 50.6488 28.5Z"
                    fill="#906FC2"
                    stroke="#3C3D51"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {dialogue && dialogueType === "Notification" && <Notification />}
    </>
  );
};

export default Navbar;
