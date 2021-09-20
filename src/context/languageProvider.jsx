import React, { createContext, useState, useEffect } from "react";

import { useLocation } from "@reach/router";

import split from "lodash/split";
import remove from "lodash/remove";
import head from "lodash/head";
import last from "lodash/last";

import useLanguages from "../hooks/useLanguages";

export const LangContext = createContext({});

const isNumber = (value) => !Number.isNaN(Number(value));

const LanguageProvider = (props) => {
  // Hooks import

  const { defaultLanguage, defaultBlogPath } = useLanguages();

  const { pathname } = useLocation();

  // URL evaluation helpers

  const currentLocation = pathname; // Get location string
  const currentLocationArray = split(currentLocation, "/"); // Convert string to array
  const currentLocationArrayClean = remove(currentLocationArray, 0); // Remove first blank array item generated by default
  const currentLocationArrayHead = head(currentLocationArrayClean); // Get value of first cleaned URL array, if length > 2, it is a default english page
  const currentLocationLast = last(currentLocationArrayClean);
  const currentLocationSecondToLast =
    currentLocationArrayClean[currentLocationArrayClean.length - 2];
  const archiveNumber = Number(currentLocationLast); // Returns NaN if not a paginated archive page

  // States initialization

  const [currentLanguage, setCurrentLanguage] = useState(() => {
    const initialLanguage = !currentLocationArrayHead
      ? defaultLanguage
      : currentLocationArrayHead.length === 2
      ? currentLocationArrayHead
      : defaultLanguage;
    return initialLanguage;
  });

  const [homeDef, setHomeDef] = useState(() => {
    const initialValue = currentLocationArrayClean.length === 0 && true;
    return initialValue;
  });

  const [homeSec, setHomeSec] = useState(() => {
    const initialValue = !currentLocationArrayHead
      ? false
      : currentLocationArrayHead.length === 2 &&
        currentLocationArrayClean.length === 1 &&
        true;
    return initialValue;
  });

  const [isPage, setIsPage] = useState(() => {
    const initialValue = !currentLocationLast
      ? false
      : currentLocationLast !== defaultBlogPath &&
        currentLocationLast.length > 2 &&
        currentLocationSecondToLast !== defaultBlogPath &&
        true;
    return initialValue;
  });

  const [pageName, setPageName] = useState(() => {
    const name = !currentLocationLast
      ? ""
      : currentLocationLast !== defaultBlogPath &&
        currentLocationLast.length > 2 &&
        currentLocationSecondToLast !== defaultBlogPath
      ? currentLocationLast
      : "";
    return name;
  });

  const [isPost, setIsPost] = useState(() => {
    const initialValue =
      currentLocationSecondToLast === defaultBlogPath &&
      !isNumber(currentLocationLast) &&
      true;
    return initialValue;
  });

  const [postName, setPostName] = useState(() => {
    const name =
      currentLocationSecondToLast === defaultBlogPath &&
      !isNumber(currentLocationLast)
        ? currentLocationLast
        : "";
    return name;
  });

  const [isPaginatedArchive, setIsPaginatedArchive] = useState(() => {
    const initialValue = isNumber(archiveNumber) && true;
    return initialValue;
  });

  const [pageNumber, setPageNumber] = useState(() => {
    const initialNumber = isNumber(archiveNumber) && archiveNumber;
    return initialNumber;
  });

  const [isArchiveRoot, setIsArchiveRoot] = useState(() => {
    const initialValue = currentLocationLast === defaultBlogPath && true;
    return initialValue;
  });

  // Update current language

  useEffect(() => {
    if (!currentLocationArrayHead) setCurrentLanguage(defaultLanguage);
    else if (currentLocationArrayHead.length === 2)
      // If user accesses a non-default language page
      setCurrentLanguage(currentLocationArrayHead);
    // Else if user accesses a to a default language page
    return () => {
      setCurrentLanguage(defaultLanguage);
    };
  }, [currentLocationArrayHead, defaultLanguage]);

  // Update initial states

  useEffect(() => {
    if (currentLocationArrayClean.length === 0) {
      setHomeDef(true);
    } else if (
      currentLocationArrayHead.length === 2 &&
      currentLocationArrayClean.length === 1
    ) {
      setHomeSec(true);
    }
    return () => {
      setHomeDef(false);
      setHomeSec(false);
    };
  }, [currentLocationArrayHead, currentLocationArrayClean]);

  useEffect(() => {
    if (!currentLocationLast) return;
    if (
      currentLocationLast !== defaultBlogPath &&
      currentLocationLast.length > 2 &&
      currentLocationSecondToLast !== defaultBlogPath
    ) {
      setIsPage(true);
      setPageName(currentLocationLast);
    } else if (
      currentLocationSecondToLast === defaultBlogPath &&
      !isNumber(currentLocationLast)
    ) {
      setIsPost(true);
      setPostName(currentLocationLast);
    } else if (currentLocationLast === defaultBlogPath) {
      setIsArchiveRoot(true);
    }
    return () => {
      setIsPage(false);
      setIsPost(false);
      setPageName("");
      setPostName("");
      setIsArchiveRoot(false);
    };
  }, [currentLocationLast, currentLocationSecondToLast, defaultBlogPath]);

  useEffect(() => {
    if (isNumber(archiveNumber)) {
      setIsPaginatedArchive(true);
      setPageNumber(archiveNumber);
    }
    return () => {
      setIsPaginatedArchive(false);
      setPageNumber(null);
    };
  }, [archiveNumber]);

  // Store states in context

  const store = {
    pathname,
    currentLanguage,
    homeDef,
    homeSec,
    isArchiveRoot,
    isPaginatedArchive,
    pageNumber,
    isPage,
    pageName,
    isPost,
    postName,
  };

  // console.log(store);

  return (
    <LangContext.Provider value={store}>{props.children}</LangContext.Provider>
  );
};

export default LanguageProvider;
