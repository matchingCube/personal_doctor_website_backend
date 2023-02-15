import firebase from "firebase/compat";
import { auth, firebaseConfig } from "../config";
import { createContext, useEffect, useReducer, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { serverTimestamp } from "firebase/firestore";
import { getDownloadURL } from "firebase/storage";
import { useNavigate } from "react-router-dom";
import admin from "firebase/compat";
import "firebase/auth";
import "firebase/firestore";

const INITIALIZE = "INITIALIZE";
let registeredUser;

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
  firebase.firestore();
}

const initialState = {
  isAuthenticated: false,
  isInitialized: false,
  user: null,
};

const reducer = (state, action) => {
  if (action.type === INITIALIZE) {
    const { isAuthenticated, user } = action.payload;
    return {
      ...state,
      isAuthenticated,
      isInitialized: true,
      user,
    };
  }

  return state;
};

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [profile, setProfile] = useState(undefined);
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(
    () =>
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          const docRef = firebase.firestore().collection("users").doc(user.uid);
          docRef
            .get()
            .then((doc) => {
              if (doc.exists) {
                setProfile(doc.data());
              }
            })
            .catch((error) => {
              console.error(error);
            });
          dispatch({
            type: INITIALIZE,
            payload: { isAuthenticated: true, user },
          });
        } else {
          dispatch({
            type: INITIALIZE,
            payload: { isAuthenticated: false, user: null },
          });
        }
      }),
    [dispatch]
  );
  const auth = { ...state.user };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        method: "firebase",
        user: {
          id: auth.uid,
          email: auth.email,
          avatar: auth.avatar || profile?.avatar,
          displayName: auth.displayName || profile?.displayName,
          role: "user",
        },
        signIn,
        signUp,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

const signIn = async (email, password, creationTime, lastSignInTime) => {
  await firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then((result) => {
      alert("Welcome " + email);
      const creationTime = firebase.auth().currentUser.metadata.creationTime;
      const lastSignInTime =
        firebase.auth().currentUser.metadata.lastSignInTime;
      firebase.firestore().collection("users").doc(result.user?.uid).update({
        creationTime,
        lastSignInTime,
        createdAt: serverTimestamp(),
      });
      // .catch(function (error) {
      //   console.error(error.code);
      //   console.error(error.message);
      //   alert("Fail when try signin.");
      // });
    });
};

const signUp = async (
  firstName,
  lastName,
  email,
  passPort,
  phoneNumber,
  location,
  lat,
  lng,
  password
) =>
  await firebase
    .auth()
    .createUserWithEmailAndPassword(email, password)
    .then((res) => {
      registeredUser = res;
      firebase
        .firestore()
        .collection("users")
        .doc(res.user?.uid)
        .set({
          uid: res.user?.uid,
          displayName: `${firstName} ${lastName}`,
          email,
          passPort: `${passPort}`,
          trInTransitDays: "3",
          trInTransitDaysRec: "1",
          trInReturnDays: "3",
          trInReturnDaysRec: "1",
          trOSRequestDays: "3",
          trOSRequestDaysRec: "1",
          trOwnerSamples: "10",
          trOwnerSamplesRec: "3",
          samplmax: "10",
          samplmaxr: "1",
          maxsamplstartTime: Date().toLocaleString(),
          supervisor: "john.snow@test.com",
          role: "user",
          photoURL: "",
          location: `${location}`,
          lat: `${lat}`,
          lng: `${lng}`,
          phoneNumber: `${phoneNumber}`,
          // createdAt: serverTimestamp(),
        });
    })
    .then((res) => {
      firebase
        .firestore()
        .collection("mail")
        .doc(registeredUser.user?.uid)
        .set({
          uid: registeredUser.user?.uid,
          displayName: `${firstName} ${lastName}`,
          email,
        })
        .then((res) => {
          admin
            .firestore()
            .collection("mail")
            .add({
              to: email,
              message: {
                subject: "Hello from Firebase your email registered!",
                text: "This is the plaintext section of the email body.",
                html: "This is the <code>HTML</code> section of the email body.",
              },
            })
            .then(() => console.log("Queued email for delivery!"));
        });
    });

export default async function Clients(
  firstName,
  lastName,
  email,
  company,
  location,
  phoneNumber,
  aboutMe
) {
  const uid = firebase.auth().currentUser.uid;
  console.log(uid);

  await firebase
    .firestore()
    .collection("clients")
    .doc()
    .set({
      firstName: document.getElementsByName("firstName")[0].value,
      lastName: document.getElementsByName("lastName")[0].value,
      email: document.getElementsByName("email")[0].value,
      company: document.getElementsByName("company")[0].value,
      location: document.getElementsByName("location")[0].value,
      phoneNumber: document.getElementsByName("phoneNumber")[0].value,
      aboutMe: document.getElementsByName("aboutMe")[0].value,
      uid,
      // lastUpdate: serverTimestamp(),
      keyPerson: "john.witch@xpto.com",
    })
    .then(function () {
      alert("Client Add with Success");
    })
    .catch(function (error) {
      console.error(error.code);
      console.error(error.message);
      alert("Fail when try add new client.");
    });
  // .then(function (docRef) {
  //   console.log("Document written with ID: ", docRef.id);
  // });
}

export async function Employees(
  trInTransitDays,
  trInTransitDaysRec,
  trInReturnDays,
  trInReturnDaysRec,
  trOSRequestDays,
  trOSRequestDaysRec,
  trOwnerSamples,
  trOwnerSamplesRec
) {
  await firebase
    .firestore()
    .collection("users")
    .doc()
    .update({
      trInTransitDays: document.getElementsByName("trInTransitDays")[0].value,
      trInTransitDaysRec: document.getElementsByName(" trInTransitDaysRec")[0]
        .value,
      trInReturnDays: document.getElementsByName("trInReturnDays")[0].value,
      trInReturnDaysRec:
        document.getElementsByName(" trInReturnDaysRec")[0].value,
      trOSRequestDays: document.getElementsByName("trOSRequestDays")[0].value,
      trOSRequestDaysRec:
        document.getElementsByName("trOSRequestDaysRec")[0].value,
      trOwnerSamples: document.getElementsByName("trOwnerSamples")[0].value,
      trOwnerSamplesRec:
        document.getElementsByName("trOwnerSamplesRec")[0].value,
      supervisor: document.getElementsByName("supervisor")[0].value,
      role: document.getElementsByName("role")[0].value,
    })
    .then(function () {
      alert("Employee trigger form update with Success");
    })
    .catch(function (error) {
      console.error(error.code);
      console.error(error.message);
      alert("Fail when try update Employees.");
    });
}

const signOut = async () => {
  await firebase.auth().signOut();
};

export const user = onAuthStateChanged(auth, (user) => {
  if (user != null) {
    console.log("logged in!");
    const uid = firebase.auth().currentUser.uid;
    console.log(uid);
  } else {
    console.log("No user");
  }
});

function logout() {
  return firebase
    .auth()
    .signOut()
    .then(() => {
      console.log("Sign-out successful.");
    })
    .catch((error) => {
      console.log("An error happened.");
    });
}

const resetPassword = async (email) => {
  await firebase.auth().sendPasswordResetEmail(email);
};

export async function addform() {
  const uid = firebase.auth().currentUser.uid;
  const email = firebase.auth().currentUser.email;
  var supervisor;
  // const navigate = useNavigate();
  function Redirect() {
    const navigate = useNavigate();
    navigate("/dashboard/homefs");
  }
  firebase
    .firestore()
    .collection("users")
    .where("email", "==", email)
    .get()
    .then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        var data = doc.data();
        supervisor = data.supervisor;
      });
    })
    .then(async function () {
      await firebase
        .firestore()
        .collection("samples")
        .doc()
        .set({
          country: document.getElementsByName("country")[0].value,
          email,
          uid,
          registereddate: serverTimestamp(),
          registeredby: email,
          status: "Registered",
          supervisor: supervisor,
          brand: document.getElementsByName("brand")[0].value,
          samplmanag: email,
          lastmanag: document.getElementsByName("deliveredBy")[0].value,
          devTypes: document.getElementsByName("devTypes")[0].value,
          hwtype: document.getElementsByName("hwTypes")[0].value,
          os: document.getElementsByName("os")[0].value,
          tNetworks: document.getElementsByName("tNetworks")[0].value,
          // ${document.getElementsByName("tNetworks")[1].value},
          // ${document.getElementsByName("tNetworks")[2].value},
          // ${document.getElementsByName("tNetworks")[3].value}`,
          slots: document.getElementsByName("slots")[0].value,
          simCard: document.getElementsByName("simCard")[0].value,
          model: document.getElementsByName("model")[0].value,
          serialNumber: document.getElementsByName("serialNumber")[0].value,
          imei1: document.getElementsByName("imei1")[0].value,
          imei2: document.getElementsByName("imei2")[0].value,
          receiveDate: document.getElementsByName("receiveDate")[0].value,
          deliveredBy: document.getElementsByName("deliveredBy")[0].value,
          phoneNumber: document.getElementsByName("phoneNumber")[0].value,
          location: document.getElementsByName("location")[0].value,
          comments: document.getElementsByName("comments")[0].value,
        })
        .then(async function () {
          alert(email + " Sample Add with Success");
          const imei1 = document.getElementsByName("imei1")[0].value;
          const imei2 = document.getElementsByName("imei2")[0].value;
          const serialNumber =
            document.getElementsByName("serialNumber")[0].value;
          await firebase
            .firestore()
            .collection("Imei1")
            .doc(imei1)
            .set({ uid });
          await firebase
            .firestore()
            .collection("Imei2")
            .doc(imei2)
            .set({ uid });
          await firebase
            .firestore()
            .collection("serialNumber")
            .doc(serialNumber)
            .set({ uid });
          // await Redirect();
          window.location.href = "/dashboard/homefs";
        })
        .catch(function (error) {
          console.error(error.code);
          console.error(error.message);
          alert("Falha ao cadastrar, verifique o erro no console.");
        });
      const db = firebase.firestore();
      const increment = firebase.firestore.FieldValue.increment(1);
      const decrement = firebase.firestore.FieldValue.increment(-1);

      const statsRef = db.collection("CounterSamples").doc(uid);
      const storyRef = db.collection("CounterSamples").doc(`${Math.random()}`);

      const batch = db.batch();
      batch.set(storyRef, { title: "Registered" });
      batch.set(statsRef, { Registered: increment }, { merge: true });
      batch.commit();
      // console.log(storyRef);
    });
}

export async function duplicates() {
  const uid = firebase.auth().currentUser.uid;
  const imei1 = document.getElementsByName("imei1")[0].value;
  const imei2 = document.getElementsByName("imei2")[0].value;
  const serialNumber = document.getElementsByName("serialNumber")[0].value;
  var flag = 0;

  await firebase
    .firestore()
    .collection("Imei1")
    .doc(imei1)
    .get({ uid })
    .then(async (doc) => {
      if (doc.exists) {
        console.log("Imei1 already exists");
        alert("Imei1 already exists");
      } else {
        console.log("Imei1 Add with Success");
        alert("Imei1 not exists in SMS yet...");
        flag++;
      }
    })
    .catch((error) => {
      console.error(error);
    })
    .then(
      await firebase
        .firestore()
        .collection("Imei2")
        .doc(imei2)
        .get({ uid })
        .then(async (doc) => {
          if (doc.exists) {
            console.log("Imei2 already exists");
            alert("Imei2 already exists");
          } else {
            console.log("Imei2 Add with Success");
            alert("Imei2 not exists in SMS yet...");
            flag++;
          }
        })
        .catch((error) => {
          console.error(error);
        })
        .then(
          await firebase
            .firestore()
            .collection("serialNumber")
            .doc(serialNumber)
            .get({ uid })
            .then(async (doc) => {
              if (doc.exists) {
                console.log("Serial Number already exists");
                alert("Serial Number already exists");
              } else {
                console.log("New Serial Number Add with Success");
                alert(
                  "New Serial Number in SMS, please if IME1 and Imei2 also new, submit form..."
                );
                if (flag == 2) {
                  var element = document.getElementsByName("submitbtn")[0];
                  element.classList.remove("disabled");
                }
              }
            })
            .catch((error) => {
              console.error(error);
            })
        )
    );
}
export async function rules() {
  firebase
    .firestore()
    .collection("samples")
    .where("status", "==", "Registered")
    .where("email", "==", "cindy@test.com")
    .get()
    .then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        console.log(doc.id, " => ", doc.data());
      });
    });
}

// async function form2() {
//   const uid = firebase.auth().currentUser.uid;
//   console.log(uid);
//   await firebase
//     .firestore()
//     .collection("Devices")
//     .doc()
//     .set({
//       // firstName: document.getElementsByName("firstName")[0].value,
//       // lastName: document.getElementsByName("lastName")[0].value,
//       // username: document.getElementsByName("username")[0].value,
//       // city: document.getElementsByName("city")[0].value,
//       // state: document.getElementsByName("state")[0].value,
//       // zip: document.getElementsByName("zip")[0].value,
//       uid,
//       lastUpdate: serverTimestamp(),
//       brand: document.getElementsByName("brand")[0].value,
//       model: document.getElementsByName("model")[0].value,
//       kinDevice: document.getElementsByName("kinDevice")[0].value,
//       typeDevice: document.getElementsByName("typeDevice")[0].value,
//       location: document.getElementsByName("location")[0].value,
//       receiveDate: document.getElementsByName("receiveDate")[0].value,
//       courierTrackNo: document.getElementsByName("courierTrackNo")[0].value,
//       statusDevice: document.getElementsByName("statusDevice")[0].value,
//       serialNumber: document.getElementsByName("serialNumber")[0].value,
//       simCard: document.getElementsByName("simCard")[0].value,
//       imei1: document.getElementsByName("imei1")[0].value,
//       imei2: document.getElementsByName("imei2")[0].value,
//       hardwareVersion: document.getElementsByName("hardwareVersion")[0].value,
//       softwareVersion: document.getElementsByName("softwareVersion")[0].value,
//       network: document.getElementsByName("network")[0].value,
//       os: document.getElementsByName("os")[0].value,
//       osVersion: document.getElementsByName("osVersion")[0].value,
//       notify: document.getElementsByName("notify")[0].value,
//       deliveredBy: document.getElementsByName("deliveredBy")[0].value,
//       email: document.getElementsByName("email")[0].value,
//       phoneNumber: document.getElementsByName("phoneNumber")[0].value,
//       comments: document.getElementsByName("comments")[0].value,
//     });
// }

export async function editform() {
  await firebase
    .firestore()
    .collection("samples")
    .doc()
    .update({
      brand: document.getElementsByName("brands")[0].value,
      lastmanag: document.getElementsByName("lastmanag")[0].value,
      typeDevice: document.getElementsByName("devTypes")[0].value,
      hwtype: document.getElementsByName("hwTypes")[0].value,
      os: document.getElementsByName("oSystems")[0].value,
      network: document.getElementsByName("tNetworks")[0].value,
      simCard: document.getElementsByName("slots")[0].value,
      simTypes: document.getElementsByName("simTypes")[0].value,
      model: document.getElementsByName("model")[0].value,
      serialNumber: document.getElementsByName("serialNumber")[0].value,
      imei1: document.getElementsByName("imei1")[0].value,
      imei2: document.getElementsByName("imei2")[0].value,
      receiveDate: document.getElementsByName("receiveDate")[0].value,
      phoneNumber: document.getElementsByName("phoneNumber")[0].value,
      comments: document.getElementsByName("comments")[0].value,
    })
    .then(() => {
      console.log("Sign-out successful.");
    })
    .catch((error) => {
      console.log("An error happened.");
    });
}

function uploadFile(e) {
  const file = e.target.files[0];
  firebase
    .storage()
    .ref("users/" + file.name)
    .put(file)
    .then((snapshot) => {
      getDownloadURL(snapshot.ref).then((downloadURL) => {
        const photoURL = downloadURL;
        console.log(photoURL);
        console.log(firebase.auth().currentUser.uid);
        const uid = firebase.auth().currentUser.uid;
        const email = firebase.auth().currentUser.email;
        console.log(email);
        const metadata = firebase.auth().currentUser.metadata;
        console.log(metadata);
        firebase.firestore().doc(`/users/${uid}`).update({
          photoURL: photoURL,
        });
      });
    });
}

export { AuthContext, AuthProvider, logout, uploadFile };
