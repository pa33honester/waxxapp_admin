const customStyles = {
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? '#fdb8d0ff' : 'white',
    color: state.isSelected ? 'white' : 'black',
    backgroundColor: state.isSelected ? '#b93160' : undefined,
    cursor: 'pointer',
  }),
  menu: (provided) => ({
    ...provided,
    zIndex: 9999,
  }),
};

export default customStyles;
