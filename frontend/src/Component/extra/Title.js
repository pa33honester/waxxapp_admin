import { Link } from "react-router-dom";

const Title = (props) => {
  return (
    <>
      <div className="title" style={{ color: "#b93160" }}>
        
      </div>

      <div className="titlePath">
        <span>
          <Link style={{ color: "#524AE3" }} to="/admin/dashboard">
            Home
          </Link>
        </span>
        <span> / {props.name} </span>
      </div>
    </>
  );
};

export default Title;
