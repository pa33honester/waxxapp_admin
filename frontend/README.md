# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)



















 <div className="dialogueMain">
          <div className="row">
            <div className="col-12">
              <Input
                label={`Name`}
                id={`name`}
                type={`text`}
                value={name}
                placeholder={`Enter name`}
                errorMessage={error.name && error.name}
                onChange={(e) => {
                  const capitalizedValue =
                    e.target.value.charAt(0).toUpperCase() +
                    e.target.value.slice(1);
                  setName(capitalizedValue); // Set the capitalized value as the name
                  if (!capitalizedValue) {
                    setError({
                      ...error,
                      name: `Name Is Required`,
                    });
                  } else {
                    setError({
                      ...error,
                      name: "",
                    });
                  }
                }}
              />
            </div>
          </div>
          <div className="row">
            <div className="col-12 w-100">
              <div>
                <div className="d-flex align-items-center">
                  {name === "Colors" ? (
                    <>
                      <div
                        className={`prime-input ${
                          detail ? "col-11" : "col-12"
                        } `}
                      >
                        <label>Value</label>
                        <input
                          type="color"
                          className={`form-input text-capitalize`}
                          required=""
                          style={{ cursor: "pointer", padding: "5px" }}
                          value={detail}
                          onKeyPress={handleKeyPress}
                          onChange={(e) => {
                            setDetail(e.target.value);
                            if (!e.target.value) {
                              return setError({
                                ...error,
                                detail: "Details is Required!",
                              });
                            } else {
                              return setError({
                                ...error,
                                detail: "",
                              });
                            }
                          }}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <Input
                        type={`text`}
                        label={`Value`}
                        value={detail}
                        errorMessage={error.detail && error.detail}
                        newClass={`${
                          detail ? "col-11" : "col-12"
                        } text-capitalize`}
                        placeholder={`Enter detail`}
                        onChange={(e) => {
                          setDetail(e.target.value);
                          if (!e.target.value) {
                            return setError({
                              ...error,
                              detail: `Details Is Required`,
                            });
                          } else {
                            return setError({
                              ...error,
                              detail: "",
                            });
                          }
                        }}
                        onKeyPress={handleKeyPress}
                      />
                    </>
                  )}
                  {detail !== "" && (
                    <div
                      className=" px-3 text-white d-flex align-items-center justify-content-center"
                      style={{
                        
                        borderRadius: "5px",
                        cursor: "pointer",
                        backgroundColor: "#DEF213",
                        padding: "6px 0px",
                        marginTop: `${name === "Colors" ? "12px":"0px"}`
                      }}
                      onClick={addCountryList}
                    >
                      <span className="text-dark">ADD</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div>
              <div className="form-group mb-2">
              
              </div>
              <div className="mb-2">
                <div
                  className="displayCountry"
                  style={{ overflow: "auto" , border : "none" }}
                >
                  {addDetail?.map((item, id) => {
                    return (
                      <>
                        <span
                          className="ms-1 my-1 text-capitalize"
                          style={{
                            backgroundColor: "rgb(218, 216, 216)",
                            padding: "5px",
                            color: "#000",
                            borderRadius: "5px",
                            fontSize: "12px",
                            padding : "8px 10px"
                          }}
                        >
                          {item}
                          <i
                            class="fa-regular fa-circle-xmark ms-2 my-2"
                            style={{
                              background : "rgb(218, 216, 216)",
                              
                            }}
                            onClick={() => {
                              onRemove(id);
                            }}
                          ></i>
                        </span>
                      </>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

                                    <span className="badge p-2" style={{ color: "#138F00", background: "#CEFAC6", borderRadius : "10px" }}>


                                    <span className=" p-2" style={{ color: "#228070", background: "#c7ffe9",  borderRadius : "10px" }}>
