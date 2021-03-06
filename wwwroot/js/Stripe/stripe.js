﻿
$("#upgradeBtn").on('click', function () {
    $(`#modal1`).empty();
    $(`#modal1`).append(`
        <div id="users-form1" style="margin: 90px;">
                                <div class="form-style form-style-padding">
                                    <div class="div-input" id="div-usr1">
                                        <label class="label-font-sub">Number of Users</label>
                                        <input type="number" class="text-input" name="usr1" id="usr1" placeholder="@ViewBag.MinUsers" min="@ViewBag.MinUsers" onmousewheel="calculateAmt1()" onchange="calculateAmt1()" onkeyup="calculateAmt1()" required />
                                        <input type="hidden" id="tot1" name="tot1" />
                                        <input type="hidden" id="usrno1" name="usrno1" />
                                    </div>
                                    <div id="div-total1" class="div-input" >
                                        <label class="label-total label-total-main-title">Total</label>
                                        <label class="label-total label-total-content" id="total-content1" name="total-content1"></label>
                                        <label class="label-total label-total-main" name="total1" id="total1"></label>
                                        <label class="label-total label-total-content">/month</label>
                                    </div>
                                </div>
                                <div class="div-seperate">
                                    <button class="button-style" id="pay1" name="pay1" data-loading-text="Subscribing<i class='fa fa-gear fa-spin' style='font-size:20px;margin-left:4px;' ></i> ">Subscribe</button>
                                </div>
                            </div>
        `)

});

$("#custupdateBtn").on('click', function () {
    $(`#modal1`).empty();
    $("#eb-loader-planupgrade").EbLoader("show", { maskItem: { Id: "#modal-upgrade" } });
    var custid = $('#cust_id').val();
    var emailid = $('#upemailid').val();
    $.ajax({
        type: "POST",
        url: "../Stripe/GetCustomer",
        data: { cust_id: $('#cust_id').val(), sid: sid },
        success: function (data) {
            $("#eb-loader-planupgrade").EbLoader("hide");
            $(`#modal1`).append(`
        <div id="modal-users-form" style="margin: 23px 75px;">
                                <div id="modal-payment-form">
                                    <div class="form-style-sub form-style-padding">
                                        <div class="div-input div-input-border">
                                            <input type="hidden" id="cust_id" name="cust_id" value = "${custid}" />
                                            <input type="hidden" id="upemailid" name="upemailid" value = "${emailid}"/>
                                            <label class="label-font">Name</label>
                                            <input type="text" class="text-input" name="upname" id="upname" value="${data.name}" placeholder="Jenny Rosen" required />
                                        </div>
                                        <div class="div-input div-input-border">
                                            <label class="label-font">Address</label>
                                            <input type="text" class="text-input" name="upadd1" id="upadd1" value="${data.address}" placeholder="185 Berry Street Suite 550" />
                                        </div>
                                        <div class="div-input div-input-border">
                                            <label class="label-font">City</label>
                                            <input type="text" class="text-input" name="upcity" id="upcity" value="${data.city}" placeholder="San Francisco" />
                                        </div>
                                        <div class="div-input div-input-border">
                                            <label class="label-font">State</label>
                                            <input type="text" class="text-input-sub" name="upstate" id="upstate" value="${data.state}" placeholder="CA" />
                                            <label class="label-font">Zip</label>
                                            <input type="text" class="text-input-sub" name="upzip" id="upzip" value="${data.zip}" placeholder="94107" />
                                        </div>
                                        <div class="div-input">
                                            <label class="label-font">Country</label>
                                            <div class="icon_input">
                                                <select class="selectpicker countrypicker custom-select  custom-select-lg selinp" id="upcountry" data-live-search="true" data-flag="true" style="border-color: #fff;"></select>
                                                <i class="fa fa-globe fa-fw" aria-hidden="true"></i>
                                            </div>
                                            <div id="countrylbl" class="ebnotify" style=" visibility :hidden"> Select your Country</div>
                                        </div>
                                    </div>
                                    <div class="div-seperate">
                                        <button class="button-style" id="custupdate" name="custupdate" data-loading-text="Update<i class='fa fa-gear fa-spin' style='font-size:20px;margin-left:4px;' ></i> ">Update
                                        </button>
                                    </div>
                                </div>
                            </div>
        `)



            $('.selectpicker').append(`<option value='0' selected='' disabled=''>Select country</option><option data-country-code='AF' data-tokens='AF Afghanistan' value='Afghanistan'>Afghanistan</option><option data-country-code='AX' data-tokens='AX Åland Islands' value='Åland Islands'>Åland Islands</option><option data-country-code='AL' data-tokens='AL Albania' value='Albania'>Albania</option><option data-country-code='DZ' data-tokens='DZ Algeria' value='Algeria'>Algeria</option><option data-country-code='AS' data-tokens='AS American Samoa' value='American Samoa'>American Samoa</option><option data-country-code='AD' data-tokens='AD Andorra' value='Andorra'>Andorra</option><option data-country-code='AO' data-tokens='AO Angola' value='Angola'>Angola</option><option data-country-code='AI' data-tokens='AI Anguilla' value='Anguilla'>Anguilla</option><option data-country-code='AQ' data-tokens='AQ Antarctica' value='Antarctica'>Antarctica</option><option data-country-code='AG' data-tokens='AG Antigua and Barbuda' value='Antigua and Barbuda'>Antigua and Barbuda</option><option data-country-code='AR' data-tokens='AR Argentina' value='Argentina'>Argentina</option><option data-country-code='AM' data-tokens='AM Armenia' value='Armenia'>Armenia</option><option data-country-code='AW' data-tokens='AW Aruba' value='Aruba'>Aruba</option><option data-country-code='AU' data-tokens='AU Australia' value='Australia'>Australia</option><option data-country-code='AT' data-tokens='AT Austria' value='Austria'>Austria</option><option data-country-code='AZ' data-tokens='AZ Azerbaijan' value='Azerbaijan'>Azerbaijan</option><option data-country-code='BS' data-tokens='BS Bahamas' value='Bahamas'>Bahamas</option><option data-country-code='BH' data-tokens='BH Bahrain' value='Bahrain'>Bahrain</option><option data-country-code='BD' data-tokens='BD Bangladesh' value='Bangladesh'>Bangladesh</option><option data-country-code='BB' data-tokens='BB Barbados' value='Barbados'>Barbados</option><option data-country-code='BY' data-tokens='BY Belarus' value='Belarus'>Belarus</option><option data-country-code='BE' data-tokens='BE Belgium' value='Belgium'>Belgium</option><option data-country-code='BZ' data-tokens='BZ Belize' value='Belize'>Belize</option><option data-country-code='BJ' data-tokens='BJ Benin' value='Benin'>Benin</option><option data-country-code='BM' data-tokens='BM Bermuda' value='Bermuda'>Bermuda</option><option data-country-code='BT' data-tokens='BT Bhutan' value='Bhutan'>Bhutan</option><option data-country-code='BO' data-tokens='BO Bolivia' value='Bolivia'>Bolivia</option><option data-country-code='BA' data-tokens='BA Bosnia and Herzegovina' value='Bosnia and Herzegovina'>Bosnia and Herzegovina</option><option data-country-code='BW' data-tokens='BW Botswana' value='Botswana'>Botswana</option><option data-country-code='BV' data-tokens='BV Bouvet Island' value='Bouvet Island'>Bouvet Island</option><option data-country-code='BR' data-tokens='BR Brazil' value='Brazil'>Brazil</option><option data-country-code='IO' data-tokens='IO British Indian Ocean Territory' value='British Indian Ocean Territory'>British Indian Ocean Territory</option><option data-country-code='BN' data-tokens='BN Brunei Darussalam' value='Brunei Darussalam'>Brunei Darussalam</option><option data-country-code='BG' data-tokens='BG Bulgaria' value='Bulgaria'>Bulgaria</option><option data-country-code='BF' data-tokens='BF Burkina Faso' value='Burkina Faso'>Burkina Faso</option><option data-country-code='BI' data-tokens='BI Burundi' value='Burundi'>Burundi</option><option data-country-code='KH' data-tokens='KH Cambodia' value='Cambodia'>Cambodia</option><option data-country-code='CM' data-tokens='CM Cameroon' value='Cameroon'>Cameroon</option><option data-country-code='CA' data-tokens='CA Canada' value='Canada'>Canada</option><option data-country-code='CV' data-tokens='CV Cape Verde' value='Cape Verde'>Cape Verde</option><option data-country-code='KY' data-tokens='KY Cayman Islands' value='Cayman Islands'>Cayman Islands</option><option data-country-code='CF' data-tokens='CF Central African Republic' value='Central African Republic'>Central African Republic</option><option data-country-code='TD' data-tokens='TD Chad' value='Chad'>Chad</option><option data-country-code='CL' data-tokens='CL Chile' value='Chile'>Chile</option><option data-country-code='CN' data-tokens='CN China' value='China'>China</option><option data-country-code='CX' data-tokens='CX Christmas Island' value='Christmas Island'>Christmas Island</option><option data-country-code='CC' data-tokens='CC Cocos (Keeling) Islands' value='Cocos (Keeling) Islands'>Cocos (Keeling) Islands</option><option data-country-code='CO' data-tokens='CO Colombia' value='Colombia'>Colombia</option><option data-country-code='KM' data-tokens='KM Comoros' value='Comoros'>Comoros</option><option data-country-code='CK' data-tokens='CK Cook Islands' value='Cook Islands'>Cook Islands</option><option data-country-code='CR' data-tokens='CR Costa Rica' value='Costa Rica'>Costa Rica</option><option data-country-code='CI' data-tokens='CI Cote D&quot;Ivoire' value='Cote D&quot;Ivoire'>Cote D'Ivoire</option><option data-country-code='HR' data-tokens='HR Croatia' value='Croatia'>Croatia</option><option data-country-code='CY' data-tokens='CY Cyprus' value='Cyprus'>Cyprus</option><option data-country-code='CZ' data-tokens='CZ Czech Republic' value='Czech Republic'>Czech Republic</option><option data-country-code='DK' data-tokens='DK Denmark' value='Denmark'>Denmark</option><option data-country-code='DJ' data-tokens='DJ Djibouti' value='Djibouti'>Djibouti</option><option data-country-code='DM' data-tokens='DM Dominica' value='Dominica'>Dominica</option><option data-country-code='DO' data-tokens='DO Dominican Republic' value='Dominican Republic'>Dominican Republic</option><option data-country-code='EC' data-tokens='EC Ecuador' value='Ecuador'>Ecuador</option><option data-country-code='EG' data-tokens='EG Egypt' value='Egypt'>Egypt</option><option data-country-code='SV' data-tokens='SV El Salvador' value='El Salvador'>El Salvador</option><option data-country-code='GQ' data-tokens='GQ Equatorial Guinea' value='Equatorial Guinea'>Equatorial Guinea</option><option data-country-code='ER' data-tokens='ER Eritrea' value='Eritrea'>Eritrea</option><option data-country-code='EE' data-tokens='EE Estonia' value='Estonia'>Estonia</option><option data-country-code='ET' data-tokens='ET Ethiopia' value='Ethiopia'>Ethiopia</option><option data-country-code='FK' data-tokens='FK Falkland Islands (Malvinas)' value='Falkland Islands (Malvinas)'>Falkland Islands (Malvinas)</option><option data-country-code='FO' data-tokens='FO Faroe Islands' value='Faroe Islands'>Faroe Islands</option><option data-country-code='FJ' data-tokens='FJ Fiji' value='Fiji'>Fiji</option><option data-country-code='FI' data-tokens='FI Finland' value='Finland'>Finland</option><option data-country-code='FR' data-tokens='FR France' value='France'>France</option><option data-country-code='GF' data-tokens='GF French Guiana' value='French Guiana'>French Guiana</option><option data-country-code='PF' data-tokens='PF French Polynesia' value='French Polynesia'>French Polynesia</option><option data-country-code='TF' data-tokens='TF French Southern Territories' value='French Southern Territories'>French Southern Territories</option><option data-country-code='GA' data-tokens='GA Gabon' value='Gabon'>Gabon</option><option data-country-code='GM' data-tokens='GM Gambia' value='Gambia'>Gambia</option><option data-country-code='GE' data-tokens='GE Georgia' value='Georgia'>Georgia</option><option data-country-code='DE' data-tokens='DE Germany' value='Germany'>Germany</option><option data-country-code='GH' data-tokens='GH Ghana' value='Ghana'>Ghana</option><option data-country-code='GI' data-tokens='GI Gibraltar' value='Gibraltar'>Gibraltar</option><option data-country-code='GR' data-tokens='GR Greece' value='Greece'>Greece</option><option data-country-code='GL' data-tokens='GL Greenland' value='Greenland'>Greenland</option><option data-country-code='GD' data-tokens='GD Grenada' value='Grenada'>Grenada</option><option data-country-code='GP' data-tokens='GP Guadeloupe' value='Guadeloupe'>Guadeloupe</option><option data-country-code='GU' data-tokens='GU Guam' value='Guam'>Guam</option><option data-country-code='GT' data-tokens='GT Guatemala' value='Guatemala'>Guatemala</option><option data-country-code='GG' data-tokens='GG Guernsey' value='Guernsey'>Guernsey</option><option data-country-code='GN' data-tokens='GN Guinea' value='Guinea'>Guinea</option><option data-country-code='GW' data-tokens='GW Guinea-Bissau' value='Guinea-Bissau'>Guinea-Bissau</option><option data-country-code='GY' data-tokens='GY Guyana' value='Guyana'>Guyana</option><option data-country-code='HT' data-tokens='HT Haiti' value='Haiti'>Haiti</option><option data-country-code='HM' data-tokens='HM Heard Island and Mcdonald Islands' value='Heard Island and Mcdonald Islands'>Heard Island and Mcdonald Islands</option><option data-country-code='VA' data-tokens='VA Holy See (Vatican City State)' value='Holy See (Vatican City State)'>Holy See (Vatican City State)</option><option data-country-code='HN' data-tokens='HN Honduras' value='Honduras'>Honduras</option><option data-country-code='HK' data-tokens='HK Hong Kong' value='Hong Kong'>Hong Kong</option><option data-country-code='HU' data-tokens='HU Hungary' value='Hungary'>Hungary</option><option data-country-code='IS' data-tokens='IS Iceland' value='Iceland'>Iceland</option><option data-country-code='IN' data-tokens='IN India' value='India'>India</option><option data-country-code='ID' data-tokens='ID Indonesia' value='Indonesia'>Indonesia</option><option data-country-code='IE' data-tokens='IE Ireland' value='Ireland'>Ireland</option><option data-country-code='IM' data-tokens='IM Isle of Man' value='Isle of Man'>Isle of Man</option><option data-country-code='IL' data-tokens='IL Israel' value='Israel'>Israel</option><option data-country-code='IT' data-tokens='IT Italy' value='Italy'>Italy</option><option data-country-code='JM' data-tokens='JM Jamaica' value='Jamaica'>Jamaica</option><option data-country-code='JP' data-tokens='JP Japan' value='Japan'>Japan</option><option data-country-code='JE' data-tokens='JE Jersey' value='Jersey'>Jersey</option><option data-country-code='JO' data-tokens='JO Jordan' value='Jordan'>Jordan</option><option data-country-code='KZ' data-tokens='KZ Kazakhstan' value='Kazakhstan'>Kazakhstan</option><option data-country-code='KE' data-tokens='KE Kenya' value='Kenya'>Kenya</option><option data-country-code='KI' data-tokens='KI Kiribati' value='Kiribati'>Kiribati</option><option data-country-code='KW' data-tokens='KW Kuwait' value='Kuwait'>Kuwait</option><option data-country-code='KG' data-tokens='KG Kyrgyzstan' value='Kyrgyzstan'>Kyrgyzstan</option><option data-country-code='LA' data-tokens='LA Lao People&quot;S Democratic Republic' value='Lao People&quot;S Democratic Republic'>Lao People'S Democratic Republic</option><option data-country-code='LV' data-tokens='LV Latvia' value='Latvia'>Latvia</option><option data-country-code='LS' data-tokens='LS Lesotho' value='Lesotho'>Lesotho</option><option data-country-code='LR' data-tokens='LR Liberia' value='Liberia'>Liberia</option><option data-country-code='LI' data-tokens='LI Liechtenstein' value='Liechtenstein'>Liechtenstein</option><option data-country-code='LT' data-tokens='LT Lithuania' value='Lithuania'>Lithuania</option><option data-country-code='LU' data-tokens='LU Luxembourg' value='Luxembourg'>Luxembourg</option><option data-country-code='MO' data-tokens='MO Macao' value='Macao'>Macao</option><option data-country-code='MK' data-tokens='MK Macedonia, The Former Yugoslav Republic of' value='Macedonia, The Former Yugoslav Republic of'>Macedonia, The Former Yugoslav Republic of</option><option data-country-code='MG' data-tokens='MG Madagascar' value='Madagascar'>Madagascar</option><option data-country-code='MW' data-tokens='MW Malawi' value='Malawi'>Malawi</option><option data-country-code='MY' data-tokens='MY Malaysia' value='Malaysia'>Malaysia</option><option data-country-code='MV' data-tokens='MV Maldives' value='Maldives'>Maldives</option><option data-country-code='ML' data-tokens='ML Mali' value='Mali'>Mali</option><option data-country-code='MT' data-tokens='MT Malta' value='Malta'>Malta</option><option data-country-code='MH' data-tokens='MH Marshall Islands' value='Marshall Islands'>Marshall Islands</option><option data-country-code='MQ' data-tokens='MQ Martinique' value='Martinique'>Martinique</option><option data-country-code='MR' data-tokens='MR Mauritania' value='Mauritania'>Mauritania</option><option data-country-code='MU' data-tokens='MU Mauritius' value='Mauritius'>Mauritius</option><option data-country-code='YT' data-tokens='YT Mayotte' value='Mayotte'>Mayotte</option><option data-country-code='MX' data-tokens='MX Mexico' value='Mexico'>Mexico</option><option data-country-code='FM' data-tokens='FM Micronesia, Federated States of' value='Micronesia, Federated States of'>Micronesia, Federated States of</option><option data-country-code='MD' data-tokens='MD Moldova, Republic of' value='Moldova, Republic of'>Moldova, Republic of</option><option data-country-code='MC' data-tokens='MC Monaco' value='Monaco'>Monaco</option><option data-country-code='MN' data-tokens='MN Mongolia' value='Mongolia'>Mongolia</option><option data-country-code='MS' data-tokens='MS Montserrat' value='Montserrat'>Montserrat</option><option data-country-code='MA' data-tokens='MA Morocco' value='Morocco'>Morocco</option><option data-country-code='MZ' data-tokens='MZ Mozambique' value='Mozambique'>Mozambique</option><option data-country-code='MM' data-tokens='MM Myanmar' value='Myanmar'>Myanmar</option><option data-country-code='NA' data-tokens='NA Namibia' value='Namibia'>Namibia</option><option data-country-code='NR' data-tokens='NR Nauru' value='Nauru'>Nauru</option><option data-country-code='NP' data-tokens='NP Nepal' value='Nepal'>Nepal</option><option data-country-code='NL' data-tokens='NL Netherlands' value='Netherlands'>Netherlands</option><option data-country-code='AN' data-tokens='AN Netherlands Antilles' value='Netherlands Antilles'>Netherlands Antilles</option><option data-country-code='NC' data-tokens='NC New Caledonia' value='New Caledonia'>New Caledonia</option><option data-country-code='NZ' data-tokens='NZ New Zealand' value='New Zealand'>New Zealand</option><option data-country-code='NI' data-tokens='NI Nicaragua' value='Nicaragua'>Nicaragua</option><option data-country-code='NE' data-tokens='NE Niger' value='Niger'>Niger</option><option data-country-code='NG' data-tokens='NG Nigeria' value='Nigeria'>Nigeria</option><option data-country-code='NU' data-tokens='NU Niue' value='Niue'>Niue</option><option data-country-code='NF' data-tokens='NF Norfolk Island' value='Norfolk Island'>Norfolk Island</option><option data-country-code='MP' data-tokens='MP Northern Mariana Islands' value='Northern Mariana Islands'>Northern Mariana Islands</option><option data-country-code='NO' data-tokens='NO Norway' value='Norway'>Norway</option><option data-country-code='OM' data-tokens='OM Oman' value='Oman'>Oman</option><option data-country-code='PK' data-tokens='PK Pakistan' value='Pakistan'>Pakistan</option><option data-country-code='PW' data-tokens='PW Palau' value='Palau'>Palau</option><option data-country-code='PS' data-tokens='PS Palestinian Territory, Occupied' value='Palestinian Territory, Occupied'>Palestinian Territory, Occupied</option><option data-country-code='PA' data-tokens='PA Panama' value='Panama'>Panama</option><option data-country-code='PG' data-tokens='PG Papua New Guinea' value='Papua New Guinea'>Papua New Guinea</option><option data-country-code='PY' data-tokens='PY Paraguay' value='Paraguay'>Paraguay</option><option data-country-code='PE' data-tokens='PE Peru' value='Peru'>Peru</option><option data-country-code='PH' data-tokens='PH Philippines' value='Philippines'>Philippines</option><option data-country-code='PN' data-tokens='PN Pitcairn' value='Pitcairn'>Pitcairn</option><option data-country-code='PL' data-tokens='PL Poland' value='Poland'>Poland</option><option data-country-code='PT' data-tokens='PT Portugal' value='Portugal'>Portugal</option><option data-country-code='PR' data-tokens='PR Puerto Rico' value='Puerto Rico'>Puerto Rico</option><option data-country-code='QA' data-tokens='QA Qatar' value='Qatar'>Qatar</option><option data-country-code='RE' data-tokens='RE Reunion' value='Reunion'>Reunion</option><option data-country-code='RO' data-tokens='RO Romania' value='Romania'>Romania</option><option data-country-code='RW' data-tokens='RW RWANDA' value='RWANDA'>RWANDA</option><option data-country-code='SH' data-tokens='SH Saint Helena' value='Saint Helena'>Saint Helena</option><option data-country-code='KN' data-tokens='KN Saint Kitts and Nevis' value='Saint Kitts and Nevis'>Saint Kitts and Nevis</option><option data-country-code='LC' data-tokens='LC Saint Lucia' value='Saint Lucia'>Saint Lucia</option><option data-country-code='PM' data-tokens='PM Saint Pierre and Miquelon' value='Saint Pierre and Miquelon'>Saint Pierre and Miquelon</option><option data-country-code='VC' data-tokens='VC Saint Vincent and the Grenadines' value='Saint Vincent and the Grenadines'>Saint Vincent and the Grenadines</option><option data-country-code='WS' data-tokens='WS Samoa' value='Samoa'>Samoa</option><option data-country-code='SM' data-tokens='SM San Marino' value='San Marino'>San Marino</option><option data-country-code='ST' data-tokens='ST Sao Tome and Principe' value='Sao Tome and Principe'>Sao Tome and Principe</option><option data-country-code='SA' data-tokens='SA Saudi Arabia' value='Saudi Arabia'>Saudi Arabia</option><option data-country-code='SN' data-tokens='SN Senegal' value='Senegal'>Senegal</option><option data-country-code='RS' data-tokens='RS Serbia' value='Serbia'>Serbia</option><option data-country-code='ME' data-tokens='ME Montenegro' value='Montenegro'>Montenegro</option><option data-country-code='SC' data-tokens='SC Seychelles' value='Seychelles'>Seychelles</option><option data-country-code='SL' data-tokens='SL Sierra Leone' value='Sierra Leone'>Sierra Leone</option><option data-country-code='SG' data-tokens='SG Singapore' value='Singapore'>Singapore</option><option data-country-code='SK' data-tokens='SK Slovakia' value='Slovakia'>Slovakia</option><option data-country-code='SI' data-tokens='SI Slovenia' value='Slovenia'>Slovenia</option><option data-country-code='SB' data-tokens='SB Solomon Islands' value='Solomon Islands'>Solomon Islands</option><option data-country-code='ZA' data-tokens='ZA South Africa' value='South Africa'>South Africa</option><option data-country-code='GS' data-tokens='GS South Georgia and the South Sandwich Islands' value='South Georgia and the South Sandwich Islands'>South Georgia and the South Sandwich Islands</option><option data-country-code='ES' data-tokens='ES Spain' value='Spain'>Spain</option><option data-country-code='LK' data-tokens='LK Sri Lanka' value='Sri Lanka'>Sri Lanka</option><option data-country-code='SR' data-tokens='SR Suriname' value='Suriname'>Suriname</option><option data-country-code='SJ' data-tokens='SJ Svalbard and Jan Mayen' value='Svalbard and Jan Mayen'>Svalbard and Jan Mayen</option><option data-country-code='SZ' data-tokens='SZ Swaziland' value='Swaziland'>Swaziland</option><option data-country-code='SE' data-tokens='SE Sweden' value='Sweden'>Sweden</option><option data-country-code='CH' data-tokens='CH Switzerland' value='Switzerland'>Switzerland</option><option data-country-code='TW' data-tokens='TW Taiwan, Province of China' value='Taiwan, Province of China'>Taiwan, Province of China</option><option data-country-code='TJ' data-tokens='TJ Tajikistan' value='Tajikistan'>Tajikistan</option><option data-country-code='TZ' data-tokens='TZ Tanzania, United Republic of' value='Tanzania, United Republic of'>Tanzania, United Republic of</option><option data-country-code='TH' data-tokens='TH Thailand' value='Thailand'>Thailand</option><option data-country-code='TL' data-tokens='TL Timor-Leste' value='Timor-Leste'>Timor-Leste</option><option data-country-code='TG' data-tokens='TG Togo' value='Togo'>Togo</option><option data-country-code='TK' data-tokens='TK Tokelau' value='Tokelau'>Tokelau</option><option data-country-code='TO' data-tokens='TO Tonga' value='Tonga'>Tonga</option><option data-country-code='TT' data-tokens='TT Trinidad and Tobago' value='Trinidad and Tobago'>Trinidad and Tobago</option><option data-country-code='TN' data-tokens='TN Tunisia' value='Tunisia'>Tunisia</option><option data-country-code='TR' data-tokens='TR Turkey' value='Turkey'>Turkey</option><option data-country-code='TM' data-tokens='TM Turkmenistan' value='Turkmenistan'>Turkmenistan</option><option data-country-code='TC' data-tokens='TC Turks and Caicos Islands' value='Turks and Caicos Islands'>Turks and Caicos Islands</option><option data-country-code='TV' data-tokens='TV Tuvalu' value='Tuvalu'>Tuvalu</option><option data-country-code='UG' data-tokens='UG Uganda' value='Uganda'>Uganda</option><option data-country-code='AE' data-tokens='AE United Arab Emirates' value='United Arab Emirates'>United Arab Emirates</option><option data-country-code='GB' data-tokens='GB United Kingdom' value='United Kingdom'>United Kingdom</option><option data-country-code='US' data-tokens='US United States' value='United States'>United States</option><option data-country-code='UM' data-tokens='UM United States Minor Outlying Islands' value='United States Minor Outlying Islands'>United States Minor Outlying Islands</option><option data-country-code='UY' data-tokens='UY Uruguay' value='Uruguay'>Uruguay</option><option data-country-code='UZ' data-tokens='UZ Uzbekistan' value='Uzbekistan'>Uzbekistan</option><option data-country-code='VU' data-tokens='VU Vanuatu' value='Vanuatu'>Vanuatu</option><option data-country-code='VN' data-tokens='VN Viet Nam' value='Viet Nam'>Viet Nam</option><option data-country-code='VG' data-tokens='VG Virgin Islands, British' value='Virgin Islands, British'>Virgin Islands, British</option><option data-country-code='VI' data-tokens='VI Virgin Islands, U.S.' value='Virgin Islands, U.S.'>Virgin Islands, U.S.</option><option data-country-code='WF' data-tokens='WF Wallis and Futuna' value='Wallis and Futuna'>Wallis and Futuna</option><option data-country-code='EH' data-tokens='EH Western Sahara' value='Western Sahara'>Western Sahara</option><option data-country-code='ZM' data-tokens='ZM Zambia' value='Zambia'>Zambia</option><option data-country-code='ZW' data-tokens='ZW Zimbabwe' value='Zimbabwe'>Zimbabwe</option>`);

        }
    });
});




$('#pay').on('click', function () {
    stripe.createToken(card).then(function (result) {
        if (result.error) {
            // Inform the user if there was an error.
            var errorElement = document.getElementById('card-errors');
            errorElement.textContent = result.error.message;
        } else {
            let dt = new Date(result.token.created * 1000);
            result.token.created = dt.getUTCFullYear() + "-" + (dt.getUTCMonth() + 1) + "-" + dt.getUTCDate() + " " + dt.getUTCHours() + ":" + dt.getUTCMinutes() + ":" + dt.getUTCSeconds();
            console.log('hfghj');
            document.getElementById('token').value = JSON.stringify(result.token);
        }

        $.ajax({
            type: "POST",
            url: "../Stripe/Index",
            data: { user_no: $('#usrno').val(), name: $('#name').val(), email: $('#emailid').val(), address: $('#add1').val(), city: $('#city').val(), state: $('#state').val(), zip: $('#zip').val(), country: $('#country option:selected').val(), token: $('#token').val(), sid: sid },
            success: function (data) {
                $('#users-form').hide();
                $('#sub_succ1').append(`<div class="div-body-main subscribed-margin">
                                                        <div class="div-icon">
                                                            <i class="fa fa-check fa-5x"></i>
                                                        </div>
                                                        <div class="heading">
                                                            SUBSCRIBED SUCCESSFULLY
                                                        </div>
                                                        <div class="div-sub-desc">
                                                            You have successfully subscribed to ${data.plan} on ${data.created}
                                                        </div>
                                                        <div class="div-sub-headings">
                                                            <div class="col-md-12 div-sub-heading">
                                                                <div class="col-md-6 sub-heading">
                                                                    Amount per Users
                                                                </div>
                                                                <div class="col-md-6 ">
                                                                   $${data.amount}
                                                                </div>
                                                            </div>
                                                            <div class="col-md-12 div-sub-heading">
                                                                <div class="col-md-6 sub-heading">
                                                                    Total Amount
                                                                </div>
                                                                <div class="col-md-6">
                                                                    $${data.amount * data.quantity}    ($${data.amount} * ${data.quantity} Users)
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="div-footer">
                                                            You will be charged $${data.amount * data.quantity}(${data.periodStart} - ${data.periodEnd}) on ${data.periodEnd}
                                                        </div>
                                                    </div>`);
                setTimeout(viewbilldata, 1);
            }
        });
    });

});

this.viewbilldata = function () {
    location.reload();
}



$('#modal1').on('click', '#pay1', function () {
    var $this = $('#pay1');
    var minusr = $('#minusr').val();
    $('#modal-upgrade').show();
    var usr = $('#usr1').val();
    if (usr < minusr) {
        EbMessage("show", { Message: "You have " + minusr + " active users. Please delete users and proceed!!!", Background: "#aa0000" })
    }
    else {
        $this.button('loading');
        $.ajax({
            type: "POST",
            url: "../Stripe/UpdateCustomerSubscription",
            data: { user_no: $('#usr1').val(), cust_id: $('#cust_id').val(), sid: sid },
            success: function (data) {
                $(`#modal1`).empty();
                $(`#modal1`).append(`
                        <div class="div-icon">
                            <i class="fa fa-check fa-5x"></i>
                        </div>
                        <div class="heading">
                            SUBSCRIBED SUCCESSFULLY
                        </div>
                        <div class="div-sub-desc">
                            You have successfully subscribed to ${data.plan} on ${data.created}
                        </div>
                        <div class="div-sub-headings">
                            <div class="col-md-12 div-sub-heading">
                                <div class="col-md-6 sub-heading">
                                    Amount per Users
                                </div>
                                <div class="col-md-6 ">
                                   $${data.amount}
                                </div>
                            </div>
                            <div class="col-md-12 div-sub-heading">
                                <div class="col-md-6 sub-heading">
                                    Total Amount
                                </div>
                                <div class="col-md-6">
                                    $${data.amount * data.quantity}    ($${data.amount} * ${data.quantity} Users)
                                </div>
                            </div>
                        </div>
                        <div class="div-footer">
                            You will be charged $${data.amount * data.quantity} (${data.periodStart} - ${data.periodEnd}) on ${data.periodEnd}
                        </div>
                    `);
                this.upgradecontent(data);
                $("#planUpgrade").trigger("reset");
            }.bind(this)
        });
    }
}.bind(this));

this.upgradecontent = function (data) {
    var html = `You are currently using ${data.plan} plan for ${data.quantity} users per month. You can upgrade your plan for having more users, cost $${data.amount} for each.`
    $(".upgrade-content").empty().append(html);
    var con = ` ${data.invoice.data[i].description}`;
    $("#up_inv_desc").empty().append(con);
    var amt = `<p class="payment-content">$${data.invoice.data[i].amount}</p>`;
    $("#up_inv_amt").empty().append(amt);
    //$("#planUpgrade").modal("toggle");
}.bind(this);


$('#modal1').on('click', '#custupdate', function () {
    var $this = $('#custupdate');
    $this.button('loading');
    $.ajax({
        type: "POST",
        url: "../Stripe/UpdateCustomerCard",
        data: { cust_id: $('#cust_id').val(), name: $('#upname').val(), email: $('#upemailid').val(), address: $('#upadd1').val(), city: $('#upcity').val(), state: $('#upstate').val(), zip: $('#upzip').val(), country: $('#upcountry option:selected').val(), sid: sid },
        success: function (data) {
            $this.button('reset');
            this.updatebillingcontent(data);
            $("#modal-upgrade .close").click();
            EbMessage("show", { Message: "Billing Details Updated!!!", Background: "#00AD6E" })
        }.bind(this)
    });
}.bind(this));

this.updatebillingcontent = function (data) {
    var html = `<div class="row user-det-padding">
                                    <div class="user-det-sub-heading col-md-3 col-md-offset-1">
                                        Name
                                    </div>
                                    <div class="user-det-contents col-md-6">
                                        ${data.name}
                                    </div>
                                </div>
                                <div class="row user-det-padding">
                                    <div class="user-det-sub-heading col-md-3 col-md-offset-1">
                                        Email
                                    </div>
                                    <div class="user-det-contents col-md-6">
                                        ${data.email}
                                    </div>
                                </div>
                                <div class="row user-det-padding">
                                    <div class="user-det-sub-heading col-md-3 col-md-offset-1">
                                        Address
                                    </div>
                                    <div class="user-det-contents col-md-6">
                                        ${data.address}
                                    </div>
                                </div>
                                <div class="row user-det-padding">
                                    <div class="user-det-sub-heading col-md-3 col-md-offset-1">
                                        City
                                    </div>
                                    <div class="user-det-contents col-md-3">
                                        ${data.city}
                                    </div>
                                    <div class="user-det-sub-heading col-md-2 ">
                                        State
                                    </div>
                                    <div class="user-det-contents col-md-3">
                                        ${data.state}
                                    </div>
                                </div>
                                <div class="row user-det-padding">
                                    <div class="user-det-sub-heading col-md-3 col-md-offset-1">
                                        Country
                                    </div>
                                    <div class="user-det-contents col-md-3">
                                        ${data.country}
                                    </div>
                                    <div class="user-det-sub-heading col-md-2">
                                        Zip
                                    </div>
                                    <div class="user-det-contents col-md-3">
                                        ${data.zip}
                                    </div>
                                </div>`
    $(".cust-update").empty().append(html);
}.bind(this);

$('#modal2').on('click', '#addcard', function () {
    stripe.createToken(card).then(function (result) {
        if (result.error) {
            // Inform the user if there was an error.
            var errorElement = document.getElementById('card-errors');
            errorElement.textContent = result.error.message;
        } else {
            let dt = new Date(result.token.created * 1000);
            result.token.created = dt.getUTCFullYear() + "-" + (dt.getUTCMonth() + 1) + "-" + dt.getUTCDate() + " " + dt.getUTCHours() + ":" + dt.getUTCMinutes() + ":" + dt.getUTCSeconds();
            console.log('hfghj');
            document.getElementById('tokenid').value = JSON.stringify(result.token);
        }
        $.ajax({
            type: "POST",
            url: "../Stripe/AddCustomerCard",
            data: { cust_id: $('#cust_id').val(), token: $('#tokenid').val(), sid: sid },
            success: function (data) {
                this.updatecardcontent(data);
                $("#modal-card .close").click();
                alert("New Card Created!!!");
            }.bind(this)
        });
    });
}.bind(this));





this.updatecardcontent = function (data) {
    var html = ``;
    $(".cardupdate").empty();
    for (var i = 0; i < data.count; i++) {
        html = html + ` <div class="div-card row">
                                <input type="hidden" id="cardid" name="cardid" value="${data.cards.card[i].cardId}" />
                                    <div class="col-md-1">`;
        if (data.defaultSourceId == data.cards.card[i].cardId) {
            html = html + `<input type="radio" name="cards" class="SelectCard" value="${data.cards.card[i].cardId}" checked />`;
        }
        else {
            html = html + `<input type="radio" name="cards" class="SelectCard" value="${data.cards.card[i].cardId}" />`;
        }
        html = html + `</div>
                                     <div class="col-md-5 card-number">
                                          **** **** **** ${data.cards.card[i].last4}
                                                </div>
                                                <div class="col-md-4 card-exp">
                                                    Exp. (${data.cards.card[i].expMonth} / ${data.cards.card[i].expYear})
                                                </div>
                                                <div class="col-md-1">
                                                </div>
                                                <div class="col-md-1 cardrem">
                                                    <i class="fa fa-trash"></i>
                                                </div>
                                            </div>`;
    }
    $(".cardupdate").empty().append(html);
    $('.cardrem').off('click').on('click', cardremoval.bind(this));
}.bind(this);

$('.cardrem').off('click').on('click', cardremoval.bind(this));
function cardremoval(e) {
    let val = $(e.target).parent().siblings("input").val();
    $.ajax({
        type: "POST",
        url: "../Stripe/RemoveCustomerCard",
        data: { cust_id: $('#cust_id').val(), card_id: val, sid: sid },
        success: function (data) {
            if (data.status) {
                this.updatecardcontent(data);
                alert("Card Removed Successfully !!!");
            }
            else {
                alert("Cannot Remove Default Card !!!");
            }
        }.bind(this)
    });
}


$('.SelectCard').on('click', function (e) {
    let val = e.target.getAttribute("value");
    //alert(val);
    $.ajax({
        type: "POST",
        url: "../Stripe/ChangeCardSource",
        data: { cust_id: $('#cust_id').val(), card_id: val, sid: sid },
        success: function (data) {
            alert("Default Source Card Updated !!!");
        }
    });
});


