package com.example.hypertalk

import androidx.appcompat.app.AppCompatActivity
import android.os.Bundle
import android.view.KeyEvent
import android.view.MotionEvent
import android.view.View
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient



class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val mWebView = findViewById<View>(R.id.WebView) as WebView
        mWebView.loadUrl("https://www.youtube.com/")

        val webSetting:WebSettings = mWebView.settings
        webSetting.javaScriptEnabled=true
        mWebView.webViewClient= WebViewClient()

        mWebView.canGoBack()
        mWebView.setOnKeyListener(View.OnKeyListener { v, keyCode, event ->
            if (keyCode == KeyEvent.KEYCODE_BACK

                && event.action == MotionEvent.ACTION_UP
                && mWebView.canGoBack()){
                mWebView.goBack()
                return@OnKeyListener true
            }
            false

        } )


    }
}