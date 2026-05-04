package com.dashboard.pi360;

import android.os.Bundle;
import androidx.core.splashscreen.SplashScreen;
import androidx.core.view.WindowCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

  @Override
  public void onCreate(Bundle savedInstanceState) {
    SplashScreen.installSplashScreen(this);
    super.onCreate(savedInstanceState);
    // Keep WebView layout below status bar (pairs with StatusBar overlaysWebView: false).
    WindowCompat.setDecorFitsSystemWindows(getWindow(), true);
  }
}
