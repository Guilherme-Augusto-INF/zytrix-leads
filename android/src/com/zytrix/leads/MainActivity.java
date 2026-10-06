package com.zytrix.leads;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.pm.ResolveInfo;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import android.net.Uri;
import android.os.Bundle;
import android.view.Gravity;
import android.view.View;
import android.view.WindowInsets;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;

/** Online companion. Authentication and cookies belong to the user's browser, never a WebView. */
public final class MainActivity extends Activity {
    private static final String SITE = "https://zytrix-leads.guilhermeaugusto2525.chatgpt.site/";
    private TextView status;
    private int dp(int value) { return Math.round(value * getResources().getDisplayMetrics().density); }
    private TextView text(String value, int size, int color) {
        TextView view = new TextView(this);
        view.setText(value); view.setTextSize(size); view.setTextColor(color);
        view.setPadding(0, dp(10), 0, dp(10)); return view;
    }
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        final int dark = Color.rgb(16,17,27), purple = Color.rgb(176,162,255), light = Color.rgb(238,240,250);
        ScrollView scroll = new ScrollView(this); scroll.setFillViewport(true); scroll.setBackgroundColor(dark);
        final LinearLayout panel = new LinearLayout(this); panel.setOrientation(LinearLayout.VERTICAL);
        panel.setGravity(Gravity.CENTER_VERTICAL); panel.setPadding(dp(28),dp(28),dp(28),dp(28));
        scroll.addView(panel,new ScrollView.LayoutParams(-1,-1)); setContentView(scroll);
        scroll.setOnApplyWindowInsetsListener(new View.OnApplyWindowInsetsListener(){ public WindowInsets onApplyWindowInsets(View view,WindowInsets insets){
            panel.setPadding(dp(28)+insets.getSystemWindowInsetLeft(),dp(28)+insets.getSystemWindowInsetTop(),dp(28)+insets.getSystemWindowInsetRight(),dp(28)+insets.getSystemWindowInsetBottom());
            return insets;
        }}); scroll.requestApplyInsets();
        TextView mark=text("Z",60,purple); mark.setTypeface(Typeface.DEFAULT,Typeface.BOLD); panel.addView(mark);
        TextView title=text("Zytrix Leads",30,light); title.setTypeface(Typeface.DEFAULT,Typeface.BOLD); panel.addView(title);
        panel.addView(text("Suas oportunidades, sempre por perto.",18,light));
        panel.addView(text("Este app acessa a versão online em uma aba segura do seu navegador. Entre com a sua conta do ChatGPT, se solicitado. O endereço permanece visível para você conferir o login.",16,Color.rgb(183,189,209)));
        Button open=new Button(this); open.setText("Abrir meus leads"); open.setAllCaps(false); open.setTextSize(17); open.setMinHeight(dp(54)); open.setTextColor(dark);
        GradientDrawable background=new GradientDrawable(); background.setColor(purple); background.setCornerRadius(dp(12)); open.setBackground(background);
        panel.addView(open,new LinearLayout.LayoutParams(-1,dp(56))); open.setOnClickListener(new View.OnClickListener(){public void onClick(View view){launch();}});
        status=text("É necessário ter conexão com a internet e um navegador instalado.",14,Color.rgb(183,189,209)); status.setAccessibilityLiveRegion(View.ACCESSIBILITY_LIVE_REGION_POLITE); panel.addView(status);
        panel.addView(text("Os dados ficam no seu workspace online. O APK não lê senhas, não guarda leads no aparelho e não envia mensagens automaticamente. Os lembretes precisam do painel aberto.",14,Color.rgb(183,189,209)));
        panel.addView(text("Android 6 ou superior · versão 1.0.0",13,Color.rgb(183,189,209)));
        if(state==null)open.postDelayed(new Runnable(){public void run(){launch();}},400);
    }
    private void launch() {
        Intent browser = new Intent(Intent.ACTION_VIEW,Uri.parse(SITE)); browser.addCategory(Intent.CATEGORY_BROWSABLE);
        ResolveInfo selected=getPackageManager().resolveActivity(browser,0);
        if(selected!=null){
            String pkg=selected.activityInfo.packageName;
            Intent service=new Intent("android.support.customtabs.action.CustomTabsService").setPackage(pkg);
            if(!getPackageManager().queryIntentServices(service,0).isEmpty()){
                browser.setPackage(pkg);
                Bundle extras=new Bundle(); extras.putBinder("android.support.customtabs.extra.SESSION",null); browser.putExtras(extras);
                browser.putExtra("android.support.customtabs.extra.TOOLBAR_COLOR",Color.rgb(16,17,27));
                browser.putExtra("android.support.customtabs.extra.TITLE_VISIBILITY",1);
            }
        }
        try{startActivity(browser);status.setText("Voltou ao app? Toque em Abrir meus leads para continuar.");}
        catch(ActivityNotFoundException failure){status.setText("Nenhum navegador disponível. Instale um navegador compatível e tente novamente.");}
        catch(SecurityException failure){status.setText("O navegador não permitiu a abertura. Abra o endereço do Zytrix manualmente no navegador.");}
    }
}
