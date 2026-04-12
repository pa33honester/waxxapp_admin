import { useState } from "react";

const Input = (props) => {
  const {
    label,
    name,
    id,
    type,
    onChange,
    newClass,
    value,
    errorMessage,
    placeholder,
    disabled,
    readOnly,
    checked,
    accept,
    onKeyPress,
    onClick
  } = props;

  const [types, setTypes] = useState(type);

  const hideShow = () => {
    types === "password" ? setTypes("text") : setTypes("password");
  };

  return (
    <>
      <div className={`prime-input  ${type} ${newClass}`}>
        <label htmlFor={id}>{label}</label>
        <input
          type={types}
          className="form-input"
          id={id}
          onChange={onChange}
          value={value}
          name={name}
          accept={accept}
          onWheel={(e) => type === "number" && e.target.blur()}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          onKeyPress={onKeyPress}
          checked={checked}
          onClick={onClick}
        />
        

        {type !== "search" && (
          <p className="errorMessage">{errorMessage && errorMessage}</p>
        )}
        

        {type === "password" && (
          <div className="passHideShow" onClick={hideShow}>
            {types === "password" ? (
              <i class="fa-solid fa-eye"></i>
            ) : (
              <i class="fa-solid fa-eye-slash"></i>
            )}
          </div>
        )}
        {type === "search" && !value && (
          <div className="searching">
            <i class="fa-solid fa-magnifying-glass"></i>
          </div>
        )}
      </div>
    </>
  );
};

export default Input;
