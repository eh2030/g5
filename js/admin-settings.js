/* ==========================================
   General Manager - Settings save flow
   Save and verify persisted values from the API.
========================================== */
(function(){
    document.addEventListener("click",async function(event){
        const btn=event.target.closest("#saveSettingsBtn");
        if(!btn)return;

        event.preventDefault();
        event.stopImmediatePropagation();
        if(btn.dataset.saving==="1")return;

        const oldHtml=btn.innerHTML;
        const fields={
            uploadDay:document.getElementById("uploadDay"),
            startTime:document.getElementById("startTime"),
            endTime:document.getElementById("endTime")
        };
        const expected={
            uploadDay:fields.uploadDay?.value ?? "",
            startTime:fields.startTime?.value ?? "",
            endTime:fields.endTime?.value ?? ""
        };

        btn.dataset.saving="1";
        btn.disabled=true;
        btn.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> جارٍ حفظ الإعدادات...';

        try{
            const result=await api("saveSettings",expected);

            if(!result || result.success!==true){
                throw new Error(result?.message || "الخادم لم يؤكد حفظ الإعدادات.");
            }

            if(typeof invalidateApiCache==="function")invalidateApiCache();

            // Verify by reading the settings back from the server, not just trusting
            // the save response. This catches deployments that return success without persisting.
            const check=await api("getSettings");
            const saved=check?.settings || {};
            const same=check?.success===true &&
                String(saved.uploadDay ?? "")===String(expected.uploadDay) &&
                String(saved.startTime ?? "")===String(expected.startTime) &&
                String(saved.endTime ?? "")===String(expected.endTime);

            if(!same){
                throw new Error("الخادم ردّ بنجاح، لكن القيم المقروءة بعد الحفظ لا تطابق القيم الجديدة. غالبًا رابط Apps Script لا يشير إلى خدمة الإعدادات الصحيحة أو أن الحفظ لا يكتب إلى الشيت.");
            }

            alert("تم حفظ الإعدادات والتحقق من قراءتها من الخادم بنجاح.");
        }catch(error){
            console.error(error);
            alert("لم يتم التأكد من حفظ الإعدادات: "+(error.message||error));
        }finally{
            btn.disabled=false;
            btn.dataset.saving="0";
            btn.innerHTML=oldHtml;
        }
    },true);
})();
