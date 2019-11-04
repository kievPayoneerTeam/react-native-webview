import React from 'react';
import { Linking, View, ActivityIndicator, Text } from 'react-native';
import minimatch from 'minimatch'
import {
  WebViewNavigationEvent,
  OnShouldStartLoadWithRequest, OnCanceledRequest,
} from './WebViewTypes';
import styles from './WebView.styles';

const defaultOriginWhitelist = ['**'];

const passesWhitelist = (
  whitelist: readonly string[],
  url: string,
) => {
  return whitelist.some(x => minimatch(url, x));
};

const createOnShouldStartLoadWithRequest = (
  loadRequest: (
    shouldStart: boolean,
    url: string,
    lockIdentifier: number,
  ) => void,
  originWhitelist: readonly string[],
  onShouldStartLoadWithRequest?: OnShouldStartLoadWithRequest,
) => {
  return ({ nativeEvent }: WebViewNavigationEvent) => {
    let shouldStart = true;
    const { url, lockIdentifier } = nativeEvent;

    if (!passesWhitelist(['about:blank', ...(originWhitelist || [])], url)) {
      Linking.openURL(url);
      shouldStart = false;
    }

    if (onShouldStartLoadWithRequest) {
      shouldStart = onShouldStartLoadWithRequest(nativeEvent);
    }

    loadRequest(shouldStart, url, lockIdentifier);
  };
};

const createOnCanceledRequest = (
    onCanceledRequest?: OnCanceledRequest,
) => {
  return ({ nativeEvent }: WebViewNavigationEvent) => {
    if (onCanceledRequest) {
      onCanceledRequest(nativeEvent);
    }
  };
};

const defaultRenderLoading = () => (
  <View style={styles.loadingOrErrorView}>
    <ActivityIndicator />
  </View>
);
const defaultRenderError = (
  errorDomain: string | undefined,
  errorCode: number,
  errorDesc: string,
) => (
  <View style={styles.loadingOrErrorView}>
    <Text style={styles.errorTextTitle}>Error loading page</Text>
    <Text style={styles.errorText}>{`Domain: ${errorDomain}`}</Text>
    <Text style={styles.errorText}>{`Error Code: ${errorCode}`}</Text>
    <Text style={styles.errorText}>{`Description: ${errorDesc}`}</Text>
  </View>
);

export {
  defaultOriginWhitelist,
  createOnShouldStartLoadWithRequest,
  defaultRenderLoading,
  defaultRenderError,
  createOnCanceledRequest,
};
