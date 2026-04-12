const Iconb = (props) => {
   const { newClass, btnColor, btnName, onClick, style, btnIcon, disabled , isImage  , isDeleted} = props;

  return (
    <button
      className={`themeBtn text-center ${newClass} ${btnColor}`}
      onClick={onClick}
      style={style}
      disabled={disabled}
    >
      {btnIcon && (
  <>
    {typeof btnIcon === "string" ? (
      isImage ? (
        <img
          src={btnIcon}
          style={{
            height: isDeleted ? 25 : 20,
            width: 20,
          }}
          alt="icon"
        />
      ) : (
        <i className={`${btnIcon} text-light`}></i>
      )
    ) : (
      // This is a React component like <InfoOutlinedIcon />
      <span style={{paddingLeft:"3px" }}>{btnIcon}</span>
    )}
    <span className="ms-1 text-dark">{btnName}</span>
  </>
)}

    </button>
  );
};

export default Iconb;
       