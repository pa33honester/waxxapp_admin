const Button = (props) => {
  const { newClass, btnColor, btnName, onClick, style, btnIcon, disabled , isImage  , isDeleted} = props;

  return (
    <button
      className={`themeBtn text-center ${newClass} ${btnColor}`}
      onClick={onClick}
      style={style}
      disabled={disabled}
    >
      {btnIcon ? (
        <>
        {
          isImage ?
          <img 
          src={btnIcon}
          style={{
           height: isDeleted ? 25 : 20,
           width:20,
          }}
          /> 
          :
          <i className={`${btnIcon}`} style={{color:"white"}}></i>
        }
          <span className="ms-1 " style={{color:"white"}}>{btnName}</span>
        </>
      ) : (
        btnName
      )}
    </button>
  );
};

export default Button;
       