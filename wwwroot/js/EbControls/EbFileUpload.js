class string {
    static Format(literel, ...params) {
        let s = literel;
        for (let i = 0; i < params.length; i++) {
            s = s.replace(`{${i}}`, params[i]);
        }
        return s;
    }

    static Clone(literal) {
        return new String(literal).toString();
    }
};

Array.prototype.Contains = function (item) {
    let stat = false;
    for (let i = 0; i < this.length; i++) {
        if (this[i] === item) {
            stat = true;
            break;
        } 
    }
    return stat;
}

function is_cached(src) {
    var image = new Image();
    image.src = src;
    return image.complete;
}

class EbFupStaticData {
    constructor() {
        this.SpinImage = `data:image/gif;base64,R0lGODlhyADIAPcAABw+cR0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ciRHeTpejlR7qGaOuHObxIKs04+53pW/5JbC5pjD5
5jD55nE55vF6JzG6J/H6aPK6qnN67DR7bbV7rvX77/a8Mzh8/7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////yH/C05FVFNDQVBFMi4wAwEAAAAh+QQJAwAtACwAAAAAyADIAAAI/gBbCBxIsKDBgwgTKlzIsKHDhxAjSpxIsaLFixgzatzIsaPHjyBDihxJsqTJkyhTqlzJsqXLlzBjypxJs6bNmzhz6tzJs6fPn0CDCh1KtKjRo0iTKl3KtKnTp1CjSp1KtarVq1izat3KtavXr2DDih1LtqzZs2jTql3Ltq3bt3Djyp1Lt67du3jz6t
3Lt6/fv4ADCx5MuLDhw4gTK17MuLHjx5AjS55MubLly5gza97MubPnz6BDix5NurTp06hTq17NurXr17Bjy55Nu7bt27hz697Nu7fv35wtCLcgMIDxAMWP4x5OvMVx5M6V32ae3Hh16LapR7e+HTvw7+CviSN8jpv8QfO20RdUT5v9QPfh4+82T196eun1ud/nnt97e/wA6iffgAQWaOCBCCao4IIMNujggxBGKOGEFFZo4YUYZqjhhhx26OGHIIYo4ogklmjiiSimqOKKLLbo4oswxijjjDTWaOONOOao44489ujjj0AGKeSQRBZp5JFIJqnkkkw26eSTeAUEACH5BAkDAC0ALAAAAADIAMgAhxw+cR0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ciRHeTpejlR7qGaOuHObxIKs04+53pW/5JbC5pjD55jD55nE55vF6JzG6J/H6aPK6qnN67DR7bbV7rvX77/a8Mzh8/7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v/
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wj+AFsIHEiwoMG
DCBMqXMiwocOHECNKnEixosWLGDNq3Mixo8ePIEOKHEmypMmTKFOqXMmypcuXMGPKnEmzps2bOHPq3Mmzp8+fQIMKHUq0qNGjSJMqXcq0qdOnUKNKnUq1qtWrWLNq3cq1q9evYMOKHUu2rNmzaNOqXcu2rdu3cOPKnUu3rt27ePPq3cu3r9+/gAMLHky4sOHDiBMrXsy4sePHkCNLnky5suXLmDNr3sy5s+fPoEOLHk26tOnTqFOrXs26tevXsGPLnk27tu3buHPr3s27t+/fnC0ItyAwgPEAxY/jHk68xXHkzpXfZp7ceHXotqlHt74dO/Dv4K+JI3yOm/xB87bRF1RPm/1A9+Hj7zZPX3p66fW53+ee33t7/ADqJ9+ABBZo4IEIJqjgggw26OCDEEYo4YQUVmjhhRhmqOGGHHbo4YcghijiiCSWaOKJKKao4oostujiizDGKOOMNNZo44045qjjjjz26OOPQAYp5JBEFmnkkUgmqeSSTDbp5JN4BQQAIfkECQMALQAsAAAAAMgAyACHHD5xHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yJEd5Ol6OVHuoZo64c5vEgqzTj7nelb/klsLmmMPnmMPnmcTnm8XonMbon8fpo8rqqc3rsNHtttXuu9fvv9rwzOHz/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////CP4AWwgcSLCgwYMIEypcyLChw4cQI0qcSLGixYsYM2rcyLGjx48gQ4ocSbKkyZMoU6pcybKly5cwY8qcSbOmzZs4c+rcybOnz59AgwodSrSo0aNIkypdyrSp06dQo0qdSrWq1atYs2rdyrWr169gw4odS7as2bNo06pdy7at27dw48qdS7eu3bt48+rdy7ev37+AAwseTLiw4cOIEytezLix48eQI0ueTLmy5cuYM2vezLmz58+gQ4seTbq06dOoU6tezbq169ewY8ueTbu27du4c+vezbu379+cL
i3IDCA8QDFj+MeTrzFceTOld9mntx4dei2qUe3vh078O/gr4kjfI6b/EHzttEXVE+b/UD34ePvNk9fenrp9bnf557fe3v8AOon34AEFmjggQgmqOCCDDbo4IMQRijhhBRWaOGFGGao4YYcdujhhyCGKOKIJJZo4okopqjiiiy26OKLMMYo44w01mjjjTjmqOOOPPbo449ABinkkEQWaeSRSCap5JJMNunkk3gFBAAh+QQJAwAt
ACwAAAAAyADIAIccPnEdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IkR3k6Xo5Ue6hmjrhzm8SCrNOPud6Vv+SWwuaYw+eYw+eZxOebxeicxuifx+mjyuqpzeuw0e221e671++/2vDM4fP+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8I/gBbCBxIsKDBgwgTKlzIsKHDhxAjSpxIsaLFixgzatzIsaPHjyBDihxJsqTJkyhTqlzJsqXLlzBjypxJs6bNmzhz6tzJs6fPn0CDCh1KtKjRo0iTKl3KtKnTp1CjSp1KtarVq1izat3KtavXr2DDih1LtqzZs2jTql3Ltq3bt3Djyp1Lt67du3jz6t3Lt6/fv4ADCx5MuLDhw4gTK17MuLHjx5AjS55MubLly5gza97MubPnz6BDix5NurTp06hTq17NurXr17Bjy55Nu7bt27hz697Nu7fv35wtCLcgMIDxAMWP4x5OvMVx5M6V32ae3Hh16LapR7e+HTvw7+CviSN8jpv8QfO20RdUT5v9QPfh4+82T196eun1ud/nnt97e/wA6iffgAQWaOCBCCao4IIMNujggxBGKOGEFFZo4YUYZqjhhhx26OGHIIYo4ogklmjiiSimqOKKLLbo4oswxijjjDTWaOONOOao44489ujjj0AGKeSQRBZp5JFIJqnkkkw26eSTeAUEACH5BAkDADQALAAAAADIAMgAhwAAAB09bR0/cR0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch5Acy1Rgkdsml6GsWuTvXOcxXmiy4Ks04iz2o243pG94pXA5ZjD55rE6JzF6KDI6abL6qrO67HR7brW78Xd8dTm9ejx+fX5/Pz9/v7+/v7+/v7+/
v7+/v7+/v7+/v7+/v7+/v7+/v//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////wj+AGkIHEiwoMGDCBMqXMiwocOHECNKnEixosWLGDNq3Mixo8ePIEOKHEmypMmTKFOqXMmypcuXMGPKnEmzps2bOHPq3Mmzp8+fQIMKHUq0qNGjSJMqXcq0qdOnUKNKnUq1qtWrWLNq3cq1q9evYMOKHUu2rNmzaNOqXcu2rdu3cOPKnUu3rt27ePPq3cu3r9+/gAMLHky4sOHDiBMrXsy4sePHkCNLnky5suXLmDNr3sy5s+fPoEOLHk26tOnTqFOrXs26tevXsGPLnk27tu3buHPr3s27t+/fnAcIHyDQg3EPAocTv628+PHkw3E3p3EcOY3ptqdXhy4cuPfvBbGJh4/OnLxB8bTRD1Qvm/118+Dj+55OH3568vW7l9eff3l2/ADqJ9+ABBZo4IEIJqjgggw26OCDEEYo4YQUVmjhhRhmqOGGHHbo4YcghijiiCSWaOKJKKao4oostujiizDGKOOMNNZo44045qjjjjz26OOPQAYp5JBEFmnkkUgmqeSSTDbp5JN5BQQAIfkECQMANAAsAAAAAMgAyACHAAAAHT1tHT9xHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHkBzLVGCR2yaXoaxa5O9c5zFeaLLgqzTiLPajbjekb3ilcDlmMPnmsTonMXooMjppsvqqs7rsdHtutbvxd3x1Ob16PH59fn8/P3+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////CP4AaQgcSLCgwYMIEypcyLChw4cQI0qcSLGixYsYM2rcyLGjx48gQ4ocSbKkyZMoU6pcybKly5cwY8qcSbOmzZs4c+rcybOnz59AgwodSrSo0aNIkypdyrSp06dQo0qdSrWq1atYs2rdyrWr169gw4odS7as2bNo06pdy7at27dw48qdS7eu3bt48+rdy7ev37+AAwseTLiw4cOIEytezLix48eQI0ueTLmy5cuYM2vezLmz58+gQ4seTbq06dOoU6tezbq169ewY8ueTbu27du4c+vezbu379+cBwgfINCDcQ8ChxO/rbz48eTDcTencRw5jem2p1eHLhy49+8FsYmHj86cvEHxtNEPVC+b/XXz4OP7nk4ffnry9buX159/eXb8AOon34AEFmjggQgmqOCCDDbo4IMQRijhhBRWaOGFGGao4YYcdujhhyCGKOKIJJZo4okopqjiiiy26OKLMMYo44w01mjjjTjmqOOOPPbo449ABinkkEQWaeSRSCap5JJMNunkk3kFBAAh+QQJAwA0ACwAAAAAyADIAIcAAAAdPW0dP3EdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IeQHMtUYJHbJpehrFrk71znMV5osuCrNOIs9qNuN6RveKVwOWYw+eaxOicxeigyOmmy+qqzuux0e261u/F3fHU5vXo8fn1+fz8/f7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8I/gBpCBxIsKDBgwgTKlzIsKHDhxAjSpxIsaLFixgzatzIsaPHjyBDihxJsqTJkyhTqlzJsqXLlzBjypxJs6bNmzhz6tzJs6fPn0CDCh1KtKjRo0iTKl3KtKnTp1CjSp1KtarVq1izat3KtavXr2DDih1LtqzZs2jTql3Ltq3bt3Djyp1Lt67du3jz6t3Lt6/fv4ADCx5MuLDhw4gTK17MuLHjx5AjS55MubLly5gza97MubPnz6BDix5NurTp06h
Tq17NurXr17Bjy55Nu7bt27hz697Nu7fv35wHCB8g0INxDwKHE7+tvPjx5MNxN6dxHDmN6banV4cuHLj37wWxiYePzpy8QfG00Q9UL5v9dfPg4/ueTh9+evL1u5fXn395dvwA6iffgAQWaOCBCCao4IIMNujggxBGKOGEFFZo4YUYZqjhhhx26OGHIIYo4ogklmjiiSimqOKKLLbo4oswxijjjDTWaOONOOao44489ujjj0AGKeSQRBZp5JFIJqnkkkw26eSTeQUEACH5BAkDADQALAAAAADIAMgAhwAAAB09bR0/cR0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch5Acy1Rgkdsml6GsWuTvXOcxXmiy4Ks04iz2o243pG94pXA5ZjD55rE6JzF6KDI6abL6qrO67HR7brW78Xd8dTm9ejx+fX5/Pz9/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wj+AGkIHEiwoMGDCBMqXMiwocOHECNKnEixosWLGDNq3Mixo8ePIEOKHEmypMmTKFOqXMmypcuXMGPKnEmzps2bOHPq3Mmzp8+fQIMKHUq0qNGjSJMqXcq0qdOnUKNKnUq1qtWrWLNq3cq1q9evYMOKHUu2rNmzaNOqXcu2rdu3cOPKnUu3rt27ePPq3cu3r9+/gAMLHky4sOHDiBMrXsy4sePHkCNLnky5suXLmDNr3sy5s+fPoEOLHk26tOnTqFOrXs26tevXsGPLnk27tu3buHPr3s27t+/fnAcIHyDQg3EPAocTv628+PHkw3E3p3EcOY3ptqdXhy4cuPfvBbGJh4/OnLxB8bTRD1Qvm/118+Dj+55OH3568vW7l9eff3l2/ADqJ9+ABBZo4IEIJqjgggw26OCDEEYo4YQUVmjhhRhmqOGGHHbo4YcghijiiCSW
aOKJKKao4oostujiizDGKOOMNNZo44045qjjjjz26OOPQAYp5JBEFmnkkUgmqeSSTDbp5JN5BQQAIfkECQMALgAsAAAAAMgAyACHHD5xHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yIkV3Ol6OU3qnbZbAirTalsHllsLml8LmmMLmmcPnm8TnnsfoocjppMrqpsvqqMzrq87rrtDsstLtuNXuv9nwyN/yz+P00+X1/v7+/v
7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////CP4AXQgcSLCgwYMIEypcyLChw4cQI0qcSLGixYsYM2rcyLGj
x48gQ4ocSbKkyZMoU6pcybKly5cwY8qcSbOmzZs4c+rcybOnz59AgwodSrSo0aNIkypdyrSp06dQo0qdSrWq1atYs2rdyrWr169gw4odS7as2bNo06pdy7at27dw48qdS7eu3bt48+rdy7ev37+AAwseTLi
w4cOIEytezLix48eQI0ueTLmy5cuYM2vezLmz58+gQ4seTbq06dOoU6tezbq169ewY8ueTbu27du4c+vezbu379+cAwgPIHA4cRcQkkPAbbz4cIHKl99u7oJ6dObPq2e/Dry7d4LUDYiGrz0efHbb5Qeml71
eu/Dv8LtTn3+efHb676ff358fPf/j7cUn4IAEFmjggQgmqOCCDDbo4IMQRijhhBRWaOGFGGao4YYcdujhhyCGKOKIJJZo4okopqjiiiy26OKLMMYo44w01mjjjTjmqOOOPPbo449ABinkkEQWaeSRSCap5JJ
MNunkXAEBACH5BAkDAC4ALAAAAADIAMgAhxw+cR0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ciJFdzpejlN6p22WwIq02pbB5ZbC5pfC5pjC5pnD55vE557H6KHI6aTK6qbL6qjM66vO667Q7LLS7bjV7r
/Z8Mjf8s/j9NPl9f7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wj+AF0IHEiwoMGDCBMqXMiwoc
OHECNKnEixosWLGDNq3Mixo8ePIEOKHEmypMmTKFOqXMmypcuXMGPKnEmzps2bOHPq3Mmzp8+fQIMKHUq0qNGjSJMqXcq0qdOnUKNKnUq1qtWrWLNq3cq1q9evYMOKHUu2rNmzaNOqXcu2rdu3cOPKnUu3r
t27ePPq3cu3r9+/gAMLHky4sOHDiBMrXsy4sePHkCNLnky5suXLmDNr3sy5s+fPoEOLHk26tOnTqFOrXs26tevXsGPLnk27tu3buHPr3s27t+/fnAMIDyBwOHEXEJJDwG28+HCBypffbu6CenTmz6tnvw6
8u3eC1A2Ihq89Hnx22+UHppe9Xrvw7/C7U59/nnx2+u+n39+fHz3/4+3FJ+CABBZo4IEIJqjgggw26OCDEEYo4YQUVmjhhRhmqOGGHHbo4YcghijiiCSWaOKJKKao4oostujiizDGKOOMNNZo44045qjj
jjz26OOPQAYp5JBEFmnkkUgmqeSSTDbp5FwBAQAh+QQJAwAuACwAAAAAyADIAIccPnEdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IiRXc6Xo5TeqdtlsCKtNqWweWWwuaXwuaYwuaZw+ebxOeex+ih
Omkyuqmy+qozOurzuuu0Oyy0u241e6/2fDI3/LP4/TT5fX+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7//////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////8I/gBdCBxIsKDBgwgTKlzIsKHDhxAjSpxIsaLFixgzatzIsaPHjyBDihxJsqTJkyhTqlzJsqXLlzBjypxJs6bNmzhz6tzJs6fPn0CDCh1KtKjRo0iTKl3KtKnTp1C
jSp1KtarVq1izat3KtavXr2DDih1LtqzZs2jTql3Ltq3bt3Djyp1Lt67du3jz6t3Lt6/fv4ADCx5MuLDhw4gTK17MuLHjx5AjS55MubLly5gza97MubPnz6BDix5NurTp06hTq17NurXr17Bjy55Nu7bt
27hz697Nu7fv35wDCA8gcDhxFxCSQ8BtvPhwgcqX327ugnp05s+rZ78OvLt3gtQNiIavPR58dtvlB6aXvV678O/wu1Off558dvrvp9/fnx89/+PtxSfggAQWaOCBCCao4IIMNujggxBGKOGEFFZo4YUYZq
jhhhx26OGHIIYo4ogklmjiiSimqOKKLLbo4oswxijjjDTWaOONOOao44489ujjj0AGKeSQRBZp5JFIJqnkkkw26eRcAQEAIfkECQMAIAAsAAAAAMgAyACHHD5xHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT
9yHT9yJEd5NlqKUXilZo64eKLKi7Xbl8HlmsPmtdTuwNrwx97y0uX04u74+Pv9/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////CP4AQQgcSLCgwYMIEypcyLChw4cQI0qcSLGixYsYM2rcyLGjx48gQ4o
cSbKkyZMoU6pcybKly5cwY8qcSbOmzZs4c+rcybOnz59AgwodSrSo0aNIkypdyrSp06dQo0qdSrWq1atYs2rdyrWr169gw4odS7as2bNo06pdy7at27dw48qdS7eu3bt48+rdy7ev37+AAwseTLiw
4cOIEytezLix48eQI0ueTLmy5cuYM2vezLmz58+gQ4seTbq06dOoU6tezbq169ewY8ueTbu27du4c+vezbu379+cAwgPIHA4cRDGcSdHPrx489vLoz+3LV24c+vAs2snuNwghO8QlIRPLwg+PPTxBMuLx+4d/Pb32asf715b/vXj1J/bP499P/z/AAYo4IAEFmjggQgmqOCCDDbo4IMQRijhhBRW
aOGFGGao4YYcdujhhyCGKOKIJJZo4okopqjiiiy26OKLMMYo44w01mjjjTjmqOOOPPbo449ABinkkEQWaeSRSCap5JJ5BQQAIfkECQMAIAAsAAAAAMgAyACHHD5xHT9yHT9yHT9yHT9yHT9yHT9y
HT9yHT9yHT9yJEd5NlqKUXilZo64eKLKi7Xbl8HlmsPmtdTuwNrwx97y0uX04u74+Pv9/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////CP4AQQgcSLCgwYMIEypcyLChw4cQI0qcSLGixYsYM2rcyLGjx48gQ4ocSbKkyZMoU6pcybKly5cwY8qcSbOmzZs4c+rcybOnz59AgwodSrS
o0aNIkypdyrSp06dQo0qdSrWq1atYs2rdyrWr169gw4odS7as2bNo06pdy7at27dw48qdS7eu3bt48+rdy7ev37+AAwseTLiw4cOIEytezLix48eQI0ueTLmy5cuYM2vezLmz58+gQ4seTbq06dOoU6te
zbq169ewY8ueTbu27du4c+vezbu379+cAwgPIHA4cRDGcSdHPrx489vLoz+3LV24c+vAs2snuNwghO8QlIRPLwg+PPTxBMuLx+4d/Pb32asf715b/vXj1J/bP499P/z/AAYo4IAEFmjggQgmqOCCDDbo4IMQRijhhBRWaOGFGGao4YYcdujhhyCGKOKIJJZo4okopqjiiiy26OKLMMYo44w01mjjjTjmqOOOPPbo449ABinkkEQWaeSRSCap5JJ5BQQAIfkECQMAIAAsAAAAAMgAyACHHD5xHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yJEd5NlqKUXilZo64eKLKi7Xbl8HlmsPmtdTuwNrwx97y0uX04u74+Pv9/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////CP4AQQgcSLCgwYMIEypcyLChw4cQI0qcSLGixYsYM2rcyLGjx48gQ4ocSbKkyZMoU6pcybKly5cwY8qcSbOmzZs4c+rcybOnz59AgwodSrSo0aNIkypdyrSp06dQo0qdSrWq1atYs2rdyrWr169gw4odS7as2bNo06pdy7at27dw48qdS7eu3bt48+rdy7ev37+AAwseTLiw4cOIEytezLix48eQI0ueTLmy5cuYM2vezLmz58+gQ4seTbq06dOoU6tezbq169ewY8ueTbu27du4c+vezbu379+cAwgPIHA4cRDGcSdHPrx489vLoz+3LV24c+vAs2snuNwghO8QlIRPLwg+PPTxBMuLx+4d/Pb32asf715b/vXj1J/bP499P/z/AAYo4IAEFmjggQgmqOCCDDbo4IMQRijhhBRWaOGFGGao4YYcdujhhyCGKOKIJJZo4okopqjiiiy26OKLMMYo44w01mjjjTjmqOOOPPbo449ABinkkEQWaeSRSCap5JJ5BQQAIfkECQMAIAAsAAAAAMgAyACHHD5xHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yJEd5NlqKUXilZo64eKLKi7Xbl8HlmsPmtdTuwNrwx97y0uX04u74+Pv9/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////CP4AQQgcSLCgwYMIEypcyLChw4cQI0qcSLGixYsYM2rcyLGjx48gQ4ocSbKkyZMoU6pcybKly5cwY8qcSbOmzZs4c+rcybOnz59AgwodSrSo0aNIkypdyrSp06dQo0qdSrWq1atYs2rdyrWr169gw4odS7as2bNo06pdy7at27dw48qdS7eu3bt48+rdy7ev37+AAwseTLiw4cOIEytezLix48eQI0ueTLmy5cuYM2vezLmz58+gQ4seTbq06dOoU6tezbq169ewY8ueTbu27du4c+vezbu379+cAwgPIHA4cRDGcSdHPrx489vLoz+3LV24c+vAs2snuNwghO8QlIRPLwg+PPTxBMuLx+4d/Pb32asf715b/vXj1J/bP499P/z/AAYo4IAEFmjggQgmqOCCDDbo4IMQRijhhBRWaOGFGGao4YYcdujhhyCGKOKIJJZo4okopqjiiiy26OKLMMYo44w01mjjjTjmqOOOPPbo449ABinkkEQWaeSRSCap5JJ5BQQAIfkECQMAHwAsAAAAAMgAyACHHD5xHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHUByKk1+SW+dXYSwZ4+5cJnCgqvSj7nelcDkmsTnocjpudbvv9rwx97y0uX04u74+Pv9/v7+/v7+/v7+/v7+/v7+////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////CP4APwgcSLCgwYMIEypcyLChw4cQI0qcSLGixYsYM2rcyLGjx48gQ4ocSbKkyZMoU6pcybKly5cwY8qcSbOmzZs4c+rcybOnz59AgwodSrSo0aNIkypdyrSp06dQo0qdSrWq1atYs2rdyrWr169gw4odS7as2bNo06pdy7at27dw48qdS7eu3bt48+rdy7ev37+AAwseTLiw4cOIEytezLix48eQI0ueTLmy5cuYM2vezLmz58+gQ4seTbq06dOoU6tezbq169ewY8ueTbu27du4c+vezbu379+cAwgPIHA48Q/GcSdHPrx489vLoz+3LV24c+vAs2snuNxg99rfuYZPBz9ePHbq5QeG386ed/XjEeJHUP58ufz50Os/v08fu3357QUo4IAEFmjggQgmqOCCDDbo4
IMQRijhhBRWaOGFGGao4YYcdujhhyCGKOKIJJZo4okopqjiiiy26OKLMMYo44w01mjjjTjmqOOOPPbo449ABinkkEQWaeSRSCap5JJMNrlXQAAh+QQJAwAfACwAAAAAyADIAIccPnEdP3IdP3IdP3
IdP3IdP3IdP3IdP3IdP3IdQHIqTX5Jb51dhLBnj7lwmcKCq9KPud6VwOSaxOehyOm51u+/2vDH3vLS5fTi7vj4+/3+/v7+/v7+/v7+/v7+/v7//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8I/gA/CBxIsKDBgwgTKlzIsKHDhxAjSpxIsaLFixgzatzIsaPHjyBDihxJsqTJkyhTqlzJsqXLlzBjypxJs6bNmzhz6tzJs6fPn0CDCh1KtKjRo0iTKl3KtKnTp1CjSp1KtarVq1izat3KtavXr2DDih1LtqzZs2jTql3Ltq3bt3Djyp1Lt67du3jz6t3Lt6/fv4ADCx5MuLDhw4gTK17MuLHjx5AjS55MubLly5gza97MubPnz6BDix5NurTp06hTq17NurXr17Bjy55Nu7bt27hz697Nu7fv35wDCA8gcDjxD8ZxJ0c+vHjz28ujP7ctXbhz68Czaye43GD32t+5hk8HP148durlB4bfzp539eMR4kdQ/ny5/PnQ6z+/Tx+7ffntBSjggAQWaOCBCCao4IIMNujggxBGKOGEFFZo4YUYZqjhhhx26OGHIIYo4ogklmjiiSimqOKKLLbo4oswxijjjDTWaOONOOao44489ujjj0AGKeSQRBZp5JFIJqnkkkw2uVdAACH5BAkDAB8ALAAAAADIAMgAhxw+cR0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch1AcipNfklvnV2EsGePuXCZwoKr0o+53pXA5JrE56HI6bnW77/a8Mfe8tLl9OLu+Pj7/f7+/v7+/v7+/v7+/v7+/v///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wj+AD8IHEiwoMGDCBMqXMiwocOHECNKnEixosWLGDNq3Mixo8ePIEOKHEmypMmTKFOqXMmypcuXMGPKnEmzps2bOHPq3Mmzp8+fQIMKHUq0qNGjSJMqXcq0qdOnUKNKnUq1qtWrWLNq3cq1q9evYMOKHUu2rNmzaNOqXcu2rdu3cOPKnUu3rt27ePPq3cu3r9+/gAMLHky4sOHDiBMrXsy4sePHkCNLnky5suXLmDNr3sy5s+fPoEOLHk26tOnTqFOrXs26tevXsGPLnk27tu3buHPr3s27t+/fnAMIDyBwOPEPxnEnRz68ePPby6M/ty1duHPrwLNrJ7jcYPfa37mGTwc/Xjx26uUHht/Onnf14xHiR1D+fLn8+dDrP79PH7t9+e0FKOCABBZo4IEIJqjgggw26OCDEEYo4YQUVmjhhRhmqOGGHHbo4YcghijiiCSWaOKJKKao4oostujiizDGKOOMNNZo44045qjjjjz26OOPQAYp5JBEFmnkkUgmqeSSTDa5V0AAIfkECQMAHwAsAAAAAMgAyACHHD5xHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHUByKk1+SW+dXYSwZ4+5cJnCgqvSj7nelcDkmsTnocjpudbvv9rwx97y0uX04u74+Pv9/v7+/v7+/v7+/v7+/v7+////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////CP4APwgcSLCgwYMIEypcyLChw4cQI0qcSLGixYsYM2rcyLGjx48gQ4ocSbKkyZMoU6pcybKly5cwY8qcSbOmzZs4c+rcybOnz59AgwodSrSo0aNIkypdyrSp06dQo0qdSrWq1atYs2rdyrWr169gw4odS7as2bNo06pdy7at27dw48qdS7eu3bt48+rdy7ev37+AAwseTLiw4cOIEytezLix48eQI0ueTLmy5cuYM2vezLmz58+gQ4seTbq06dOoU6tezbq169ewY8ueTbu27du4c+vezbu379+cAwgPIHA48Q/GcSdHPrx489vLoz+3LV24c+vAs2snuNxg99rfuYZPBz9ePHbq5QeG386ed/XjEeJHUP58ufz50Os/v08fu3357QUo4IAEFmjggQgmqOCCDDbo4IMQRijhhBRWaOGFGGao4YYcdujhhyCGKOKIJJZo4okopqjiiiy26OKLMMYo44w01mjjjTjmqOOOPPbo449ABinkkEQWaeSRSCap5JJMNrlXQAAh+QQJAwAtACwAAAAAyADIAIccPnEdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IeQHMzVodRd6Rrk72DrdSRvOKXwuaYwuaaw+abxOedxuihyOmmy+qozOuqzuutz+yw0e200+251u/A2vDI3/LL4fPL4fP+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8I/gBbCBxIsKDBgwgTKlzIsKHDhxAjSpxIsaLFixgzatzIsaPHjyBDihxJsqTJkyhTqlzJsqXLlzBjypxJs6bNmzhz6tzJs6fPn0CDCh1KtKjRo0iTKl3KtKnTp1CjSp1KtarVq1izat3KtavXr2DDih1LtqzZs2jTql3Ltq3bt3Djyp1Lt67du3jz6t3Lt6/fv4ADCx5MuLDhw4gTK17MuLHjx5AjS55MubLly5gza97MubPnz6BDix5NurTp06hTq17NurXr17Bjy55Nu7bt27hz697Nu7fv35wDCA8gcDjxFsZxJ0c+vHjz28ujP7ctXbhz68Czaye43GD32t+5iU8HP148durlB4bfzp738gfwH1w/jh57fPnMz5O3H3++8uf3+dfegAQWaOCBCCao4IIMNujggxBGKOGEFFZo4YUYZqjhhhx26OGHIIYo4ogklmjiiSimqOKKLLbo4oswxijjjDTWaOONOOao44489ujjj0AGKeSQRBZp5JFIJqnkkkw26eSTegUEACH5BAkDAC0ALAAAAADIAMgAhxw+cR0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch5AczNWh1F3pGuTvYOt1JG84pfC5pjC5prD5pvE553G6KHI6abL6qjM66rO663P7LDR7bTT7bnW78Da8Mjf8svh88vh8/7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wj+AFsIHEiwoMGDCBMqXMiwocOHECNKnEixosWLGDNq3Mixo8ePIEOKHEmypMmTKFOqXMmypcuXMGPKnEmzps2bOHPq3Mmzp8+fQIMKHUq0qNGjSJMqXcq0qdOnUKNKnUq1qtWrWLNq3cq1q9evY
MOKHUu2rNmzaNOqXcu2rdu3cOPKnUu3rt27ePPq3cu3r9+/gAMLHky4sOHDiBMrXsy4sePHkCNLnky5suXLmDNr3sy5s+fPoEOLHk26tOnTqFOrXs26tevXsGPLnk27tu3buHPr3s27t+/fnAMIDyBwOPEWxnEnRz68ePPby6M/ty1duHPrwLNrJ7jcYPfa37mJTwc/Xjx26uUHht/OnvfyB/AfXD+OHnt8+czPk7cff77y5/f5196ABBZo4IEIJqjgggw26OCDEEYo4YQUVmjhhRhmqOGGHHbo4YcghijiiCSWaOKJKKao4oostujiizDGKOOMNNZo44045qjjjjz26OOPQAYp5JBEFmnkkUgmqeSSTDbp5JN6BQQAIfkECQMALQAsAAAAAMgAyACHHD5xHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHkBzM1aHUXeka5O9g63Ukbzil8LmmMLmmsPmm8TnncboocjppsvqqMzrqs7rrc/ssNHttNPtudbvwNrwyN/yy+Hzy+Hz/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////CP4AWwgcSLCgwYMIEypcyLChw4cQI0qcSLGixYsYM2rcyLGjx48gQ4ocSbKkyZMoU6pcybKly5cwY8qcSbOmzZs4c+rcybOnz59AgwodSrSo0aNIkypdyrSp06dQo0qdSrWq1atYs2rdyrWr169gw4odS7as2bNo06pdy7at27dw48qdS7eu3bt48+rdy7ev37+AAwseTLiw4cOIEytezLix48eQI0ueTLmy5cuYM2vezLmz58+gQ4seTbq06dOoU6tezbq169ewY8ueTbu27du4c+vezbu379+cAwgPIHA48RbGcSdHPrx489vLoz+3LV24c+vAs2snuNxg99rfuYlPBz9ePHbq5QeG386e9/IH8B9cP44ee3z5zM+Ttx9/vvLn9/nX3oAEFmjggQgmqOCCDDbo4IMQRijhhBRWaOGFGGao4YYcdujhhyCGKOKIJJZo4okopqjiiiy26OKLMMYo44w01mjjjTjmqOOOPPbo449ABinkkEQWaeSRSCap5JJMNunkk3oFBAAh+QQJAwAlACwAAAAAyADIAIccPnEdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IeQHMmSXs5Xo1Ue6hrlL52oMh+qNCGsdiMt92SveGWwOScxeigyOmkyuqqzeux0e221O692fDH3vLV5vXn8fn4+/3///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8I/gBLCBxIsKDBgwgTKlzIsKHDhxAjSpxIsaLFixgzatzIsaPHjyBDihxJsqTJkyhTqlzJsqXLlzBjypxJs6bNmzhz6tzJs6fPn0CDCh1KtKjRo0iTKl3KtKnTp1CjSp1KtarVq1izat3KtavXr2DDih1LtqzZs2jTql3Ltq3bt3Djyp1Lt67du3jz6t3Lt6/fv4ADCx5MuLDhw4gTK17MuLHjx5AjS55MubLly5gza97MubPnz6BDix5NurTp06hTq17NurXr17Bjy55Nu7bt27hz697Nu7fv35wDCA8gcDjxEsZxJ0c+vHjz28ujP7ctXbhz68Czaye43GD32t+5ik8HP148durlB4bfzp53hvcZrh9fLxt+fObY6ce2L7//bf74zZdeewQWaOCBCCao4IIMNujggxBGKOGEFFZo4YUYZqjhhhx26OGHIIYo4ogklmjiiSimqOKKLLbo4oswxijjjDTWaOONOOao44489ujjj0AGKeSQRBZp5JFIJqnkkkw26eSTUNYVEAAh+QQJAwAlACwAAAAAyADIAIccPnEdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IeQHMmSXs5Xo1Ue6hrlL52oMh+qNCGsdiMt92SveGWwOScxeigyOmkyuqqzeux0e221O692fDH3vLV5vXn8fn4+/3///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8I/gBLCBxIsKDBgwgTKlzIsKHDhxAjSpxIsaLFixgzatzIsaPHjyBDihxJsqTJkyhTqlzJsqXLlzBjypxJs6bNmzhz6tzJs6fPn0CDCh1KtKjRo0iTKl3KtKnTp1CjSp1KtarVq1izat3KtavXr2DDih1LtqzZs2jTql3Ltq3bt3Djyp1Lt67du3jz6t3Lt6/fv4ADCx5MuLDhw4gTK17MuLHjx5AjS55MubLly5gza97MubPnz6BDix5NurTp06hTq17NurXr17Bjy55Nu7bt27hz697Nu7fv35wDCA8gcDjxEsZxJ0c+vHjz28ujP7ctXbhz68Czaye43GD32t+5ik8HP148durlB4bfzp53hvcZrh9fLxt+fObY6ce2L7//bf74zZdeewQWaOCBCCao4IIMNujggxBGKOGEFFZo4YUYZqjhhhx26OGHIIYo4ogklmjiiSimqOKKLLbo4oswxijjjDTWaOONOOao44489ujjj0AGKeSQRBZp5JFIJqnkkkw26eSTUNYVEAAh+QQJAwAlACwAAAAAyADIAIccPnEdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IeQHMmSXs5Xo1Ue6hrlL52oMh+qNCGsdiMt92SveGWwOScxeigyOmkyuqqzeux0e221O692fDH3vLV5vXn8fn4+/3///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8I/gBLCBxIsKDBgwgTKlzIsKHDhxAjSpxIsaLFixgzatzIsaPHjyBDihxJsqTJkyhTqlzJsqXLlzBjypxJs6bNmzhz6tzJs6fPn0CDCh1KtKjRo0iTKl3KtKnTp1CjSp1KtarVq1izat3KtavXr2DDih1LtqzZs2jTql3Ltq3bt3Djyp1Lt67du
3jz6t3Lt6/fv4ADCx5MuLDhw4gTK17MuLHjx5AjS55MubLly5gza97MubPnz6BDix5NurTp06hTq17NurXr17Bjy55Nu7bt27hz697Nu7fv35wDCA8gcDjxEsZxJ0c+vHjz28ujP7ctXbhz68Czaye43GD32t+5ik8HP148durlB4bfzp53hvcZrh9fLxt+fObY6ce2L7//bf74zZdeewQWaOCBCCao4IIMNujggxBGKOGEFFZo4YUYZqjhhhx26OGHIIYo4ogklmjiiSimqOKKLLbo4oswxijjjDTWaOONOOao44489ujjj0AGKeSQRBZp5JFIJqnkkkw26eSTUNYVEAAh+QQJAwAlACwAAAAAyADIAIccPnEdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IeQHMmSXs5Xo1Ue6hrlL52oMh+qNCGsdiMt92SveGWwOScxeigyOmkyuqqzeux0e221O692fDH3vLV5vXn8fn4+/3///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8I/gBLCBxIsKDBgwgTKlzIsKHDhxAjSpxIsaLFixgzatzIsaPHjyBDihxJsqTJkyhTqlzJsqXLlzBjypxJs6bNmzhz6tzJs6fPn0CDCh1KtKjRo0iTKl3KtKnTp1CjSp1KtarVq1izat3KtavXr2DDih1LtqzZs2jTql3Ltq3bt3Djyp1Lt67du3jz6t3Lt6/fv4ADCx5MuLDhw4gTK17MuLHjx5AjS55MubLly5gza97MubPnz6BDix5NurTp06hTq17NurXr17Bjy55Nu7bt27hz697Nu7fv35wDCA8gcDjxEsZxJ0c+vHjz28ujP7ctXbhz68Czaye43GD32t+5ik8HP148durlB4bfzp53hvcZrh9fLxt+fObY6ce2L7//bf74zZdeewQWaOCBCCao4IIMNujggxBGKOGEFFZo4YUYZqjhhhx26OGHIIYo4ogklmjiiSimqOKKLLbo4oswxijjjDTWaOONOOao44489ujjj0AGKeSQRBZp5JFIJqnkkkw26eSTUNYVEAAh+QQJAwAhACwAAAAAyADIAIccPnEdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IiRHczV4dPdaJnkLp1n8d+qNCKtduSvOGWwOSYwuaiyemlyuqrzuu11O671+/D3PHO4/Pe6/fy9/z///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8I/gBDCBxIsKDBgwgTKlzIsKHDhxAjSpxIsaLFixgzatzIsaPHjyBDihxJsqTJkyhTqlzJsqXLlzBjypxJs6bNmzhz6tzJs6fPn0CDCh1KtKjRo0iTKl3KtKnTp1CjSp1KtarVq1izat3KtavXr2DDih1LtqzZs2jTql3Ltq3bt3Djyp1Lt67du3jz6t3Lt6/fv4ADCx5MuLDhw4gTK17MuLHjx5AjS55MubLly5gza97MubPnz6BDix5NurTp06hTq17NurXr17Bjy55Nu7bt27hz697Nu7fv35wDCA8gcDjxEMZxJ0c+vHjz28ujP7ctXbhz68Czayd4ofsFhMtthXv/fjB87fHgp5/3nh779ve/qx83T1v+9ePUn9uHrr+/e/gABijggAQWaOCBCCao4IIMNujggxBGKOGEFFZo4YUYZqjhhhx26OGHIIYo4ogklmjiiSimqOKKLLbo4oswxijjjDTWaOONOOao44489ujjj0AGKeSQRBZp5JFIJqnkkkziFRAAIfkECQMAIQAsAAAAAMgAyACHHD5xHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yHT9yIkR3M1eHT3WiZ5C6dZ/HfqjQirXbkrzhlsDkmMLmosnppcrqq87rtdTuu9fvw9zxzuPz3uv38vf8////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////CP4AQwgcSLCgwYMIEypcyLChw4cQI0qcSLGixYsYM2rcyLGjx48gQ4ocSbKkyZMoU6pcybKly5cwY8qcSbOmzZs4c+rcybOnz59AgwodSrSo0aNIkypdyrSp06dQo0qdSrWq1atYs2rdyrWr169gw4odS7as2bNo06pdy7at27dw48qdS7eu3bt48+rdy7ev37+AAwseTLiw4cOIEytezLix48eQI0ueTLmy5cuYM2vezLmz58+gQ4seTbq06dOoU6tezbq169ewY8ueTbu27du4c+vezbu379+cAwgPIHA48RDGcSdHPrx489vLoz+3LV24c+vAs2sneKH7BYTLbYV7/34wfO3x4Kef954e+/b3v6sfN09b/vXj1J/bh66/v3v4AAYo4IAEFmjggQgmqOCCDDbo4IMQRijhhBRWaOGFGGao4YYcdujhhyCGKOKIJJZo4okopqjiiiy26OKLMMYo44w01mjjjTjmqOOOPPbo449ABinkkEQWaeSRSCap5JJM4hUQACH5BAkDACEALAAAAADIAMgAhxw+cR0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ch0/ciJEdzNXh091omeQunWfx36o0Iq125K84ZbA5JjC5qLJ6aXK6qvO67XU7rvX78Pc8c7j897r9/L3/P///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////wj+AEMIHEiwoMGDCBMqXMiwocOHECNKnEixosWLGDNq3Mixo8ePIEOKHEmypMmTKFOqXMmypcuXMGPKnEmzps2bOHPq3Mmzp8+fQIMKHUq0qNGjSJMqXcq0qdOnUKNKnUq1qtWrWLNq3cq1q9evYMOKHUu2rNmzaNOqXcu2rdu3cOPKnUu3rt27ePPq3cu3r9+/gAMLHky4sOHDiBMrXsy4sePHkCNLnky5suXLmDNr3sy5s+fPoEOLHk26tOnTqFOrXs26tevXsGPLnk27tu3buHPr3s27t+/fnAMIDyBwOPEQxnEnRz68ePPby6M/ty1duHPrwLNrJ3ih+wWEy22Fe/9+MHzt8eCnn/eeHvv297+rHzdPW/7149Sf24euv797+AAGKOCABBZo4IEIJqjgggw26OCDEEYo4YQUVmjhhRhmqOGGHHbo4YcghijiiCSWaOKJKKao4oostujiizDGKOOMNNZo44045qjjjjz26OOPQAYp5JBEFmnkkUgmqeSSTOIVEAAh+QQJAwAtACwAAAAAyADIAIccPnEdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IdP3IkR3k6Xo5Ue6hmjrhzm8SCrNOPud6Vv+SWwuaYw+eYw+eZxOebxeicxuifx+mjyuqpzeuw0e221e671++/2vDM4fP+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7+/v7///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8I/gBbCBxIsKDBgwgTKlzIsKHDhxAjSpxIsaLFixgzatzIsaPHjyBDihxJsqTJkyhTqlzJsqXLlzBjypxJs6bNmzhz6tzJs6fPn0CDCh1KtKjRo0iTKl3KtKnTp1CjSp1KtarVq1izat3KtavXr2DDih1LtqzZs2jTql3Ltq3bt3Djyp1Lt67du3jz6t3Lt6/fv4ADCx5MuLDhw4gTK17MuLHjx5AjS55MubLly5gza97MubPnz6BDix5NurTp06hTq17NurXr17Bjy55Nu7bt27hz697Nu7fv35wtCLcgMIDxAMWP4x5OvMVx5M6V32ae3Hh16LapR7e+HTvw7+CviSN8jpv8QfO20RdUT5v9QPfh4+82T196eun1ud/nnt97e/wA6iffgAQWaOCBCCao4IIMNujggxBGKOGEFFZo4YUYZqjhhhx26OGHIIYo4ogklmjiiSimqOKKLLbo4oswxijjjDTWaOONOOao44489ujjj0AGKeSQRBZp5JFIJqnkkkw26eSTeAUEADsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA`;
    };
};


class EbCropper {
    constructor(options) {
        this.Options = $.extend({}, options);
        this.Result = "base64";
        this.FileUrl = null;
        this.Url = null;
        this.Cropy = null;
        this.FileName = null;
        this.CrpModal = this.appendModal();
        this.initCroper();
    };

    getFile(b65, filename) { }

    initCroper() {
        this.CrpModal.on('shown.bs.modal', this.modalShown.bind(this));
        $(this.Options.Toggle).off("click").on("click", this.toggleModal.bind(this));

        this.cropfy();
        $("." + this.Options.Container + "_rotate").closest(".btn").on("click", this.rotate.bind(this));
        $("#" + this.Options.Container + "_crop").closest(".btn").on("click", this.crop.bind(this));
        $("#" + this.Options.Container + "_save").off("click").on("click", this.saveCropfy.bind(this));
    }

    appendModal() {
        $('body').append(`<div class="modal fade" id="${this.Options.Container}crp_modal" tabindex="-1" role="dialog" aria-hidden="true">
                            <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
                              <div class="modal-content cropfy_modal" style="border-radius:0;border:none;">
                                <div class="modal-header cropfy_header" style="background: #3e8ef7;color: white;">
                                  <h5 class="modal-title" id="exampleModalLongTitle">Crop Image</h5>
                                    <i class="material-icons cropfy_close pull-right" data-dismiss="modal" style="margin-top:-2.5%;cursor: pointer" id="${this.Container}_close">close</i>
                                </div>
                                <div class="modal-body">
                                    <div class="cropy_container" style="height:450px;width:100%;padding-bottom:50px;">
                                        <div id="${this.Options.Container}_cropy_container">
                                        </div>
                                    </div>
                                <div class="modal-footer cropfy_footer" id="${this.Options.Container}_cropy_footer" style="padding-bottom: 0;padding-right:0;padding-left: 0;">
                                    <div class="btn-group" role="group">
                                    <button type="button" title="rotate_l" class="btn btn-secondary ${this.Options.Container}_rotate"><i class="fa fa-undo"></i></button>
                                    <button type="button" title="rotate_r" class="btn btn-secondary ${this.Options.Container}_rotate"><i class="fa fa-repeat"></i></button>
                                    </div>
                                  <button type="button" class="btn btn-primary" style="background-color:#528ff0;" id="${this.Options.Container}_crop"><i class="fa fa-crop"></i></button>
                                    <button type="button" class="btn btn-primary eb_btngreen" id="${this.Options.Container}_save"><i class="fa fa-save"></i></button>
                                </div>
                              </div>
                            </div>
                          </div>`);

        return $("#" + this.Options.Container + "crp_modal");
    };

    toggleModal(e) {
        this.CrpModal.modal("toggle");
    };

    cropfy() {
        this.Cropy = $("#" + this.Options.Container + "_cropy_container").croppie({
            viewport: {
                width: 200,
                height: 200
            },
            enableOrientation: true,
            enableResize: true,
            enforceBoundary: false,
            enableExif: true
        });
    };

    rotate(e) {
        var wdo = $(e.target).closest(".btn").attr("title");
        if (wdo === "rotate_r")
            this.cropie.croppie('rotate', 90);
        else
            this.cropie.croppie('rotate', -90);
    };

    crop() {
        this.Cropy.croppie('result', this.Result).then(this.cropafter.bind(this));
    };

    cropafter(b64) {
        this.FileUrl = b64;
        this.Cropy.croppie('bind', {
            url: this.FileUrl,
        });
    };

    modalShown() {
        this.Cropy.croppie('bind', {
            url: this.Url,
        });
    };

    saveCropfy(e) {
        this.toggleModal();
        this.getFile(this.FileUrl, this.FileName);
    };
};

class EbFileUpload extends EbFupStaticData {
    constructor(options) {
        super();
        this.Options = $.extend({}, options);
        this.MaxSize = this.Options.MaxSize || 5;
        this.Files = [];
        this.RefIds = [];
        this.SingleRefid = null;
        this.FileList = [];
        this.IsCropFlow = false;
        this.CurrentFimg = null;
        this.Multiple = (this.Options.Multiple) ? "multiple" : "";
        if (this.validateOpt())
            this.init();
    };

    uploadSuccess(refId) { this.SingleRefid = refId };
    windowClose() { };
    getFileRef() { return this.SingleRefid};

    validateOpt() {
        if (!this.Options.Container) {
            console.log("error:::Property 'Container' should be declared!");
            return false;
        }
        else if (!this.Options.Toggle) {
            console.log("error:::Property 'Toggle' should be declared!");
            return false;
        }
        else if (!this.Options.Type) {
            console.log("error:::FileType should be specified");
            return false;
        }
        return true;
    };

    init() {
        this.Modal = this.outerHtml();

        if (!this.Options.Multiple && this.Options.EnableCrop)
            this.cropfyFlow();
        else if (this.Options.Multiple && this.Options.EnableCrop)
            this.multiThumbFlow();
        else
            this.multiThumbFlow();

        $(this.Options.Toggle).off("click").on("click", this.toggleM.bind(this));
        $(`#${this.Options.Container}-upl-ok`).off("click").on("click", this.ok.bind(this));
        $(`#${this.Options.Container}-file-input`).off("change").on("change", this.browse.bind(this));
        $(`#${this.Options.Container}-upload-lin`).off("click").on("click", this.upload.bind(this));
        this.Modal.on("show.bs.modal", this.onToggleM.bind(this));
    };

    cropfyFlow() {      //cropy flow
        this.IsCropFlow = true;
        this._typeRatio = {
            'logo': {
                width: 250,
                height: 100
            },
            'dp': {
                width: 100,
                height: 100
            },
            'doc': {
                width: 200,
                height: 200
            },
            'location': {
                width: 250,
                height: 100
            }
        };

        this.Cropy = $("#" + this.Options.Container + "_cropy_container").croppie({
            viewport: this._typeRatio[this.Options.Context],
            enableOrientation: true,
            enableResize: this.Options.ResizeViewPort,
            enforceBoundary: false,
            enableExif: true
        });

        $(`#${this.Options.Container}-upl-container .modal-footer`).append(`
                                        <button class="pull-right crop-btn eb_btngreen" id="${this.Options.Container}-crop-lin">
                                            <i class="fa fa-crop"></i>
                                        </button>
                                    `);
        $(`#${this.Options.Container}-crop-lin`).off("click").on("click", this.cropClick.bind(this));
    };

    multiThumbFlow() {
        this.IsCropFlow = false;
        this.FullScreen = this.fullScreen();

        if ('PreviewWraper' in this.Options) {
            this.Gallery = this.appendGallery();
            this.GalleryFS = this.appendFSHtml();
            this.pullFile();
            $(".prevImgrout,.nextImgrout").off("click").on("click", this.fscreenN_P.bind(this));
        }

        if (this.Options.EnableCrop) {
            this.Cropy = this.initCropy();
            this.Cropy.getFile = function (b64, filename) {
                let block = b64.split(";");
                let contentType = block[0].split(":")[1];
                let realData = block[1].split(",")[1];
                let blob = this.b64toBlob(realData, contentType);
                this.replaceFile(blob, filename, contentType);
                $(`div[file='${this.replceSpl(filename)}']`).find("img").attr("src", b64);
            }.bind(this);
        }
        this.Modal.find('.eb-upl-bdy').on("dragover", this.handleDragOver.bind(this));
        this.Modal.find('.eb-upl-bdy').on("drop", this.handleFileSelect.bind(this));
    };

    fscreenN_P(ev) {
        let action = $(ev.target).closest("button").attr("action");
        if (action === "next" && this.CurrentFimg.next('.trggrFprev').length>0) {
            this.galleryFullScreen({ target: this.CurrentFimg.next('.trggrFprev')});
        }
        else if (action === "prev" && this.CurrentFimg.prev('.trggrFprev').length > 0){
            this.galleryFullScreen({ target: this.CurrentFimg.prev('.trggrFprev') });
        }
    };

    appendGallery() {
        let $div = null;
        if ($(this.Options.PreviewWraper).length <= 0)
            $div = $('body');
        else
            $div = $(this.Options.PreviewWraper);
        $div.append(`<div id="${this.Options.Container}_GalleryUnq" class="ebFupGalleryOt">
                        <div class="ClpsGalItem_Sgl" Catogory="DEFAULT" alt="Default">
                            <div class="Col_head" data-toggle="collapse" data-target="#DEFAULT_ColBdy">DEFAULT <span class="FcnT"></span></div>
                            <div class="Col_apndBody collapse" id="DEFAULT_ColBdy">
                            <div class="Col_apndBody_apndPort"></div>
                            </div>
                        </div>
                        ${this.getCatHtml()}
                    </div>`);
        return $(`#${this.Options.Container}_GalleryUnq`);
    }

    appendFSHtml() {
        $("body").append(`<div class="ebFupGFscreen_wraper-fade"></div>
                             <div class="ebFupGFscreen_wraper">
                                 <button class="FsClse" onclick="$('.ebFupGFscreen_wraper,.ebFupGFscreen_wraper-fade').hide();">
                                    <i class="fa fa-close"></i></button>
                                <button class="prevImgrout roundstyledbtn" action="prev"><i class="fa fa-chevron-left"></i></button>
                                <button class="nextImgrout roundstyledbtn" action="next"><i class="fa fa-chevron-right"></i></button>
                                <div class="ebFupGFscreen_inner">
                                <img src="~/images/web.png" class="FupimgIcon" />
                                <div class="ebFupGFscreen_footr">
                                    <h1 class="Fname"></h1>
                                    <h3 class="Tags"></h3>
                                </div>
                            </div>
                        </div>`);
        return $(".ebFupGFscreen_wraper,.ebFupGFscreen_wraper-fade");
    }

    getCatHtml() {
        let html = new Array();
        if ('Categories' in this.Options) {
            for (let i = 0; i < this.Options.Categories.length; i++) {
                html.push(`<div class="ClpsGalItem_Sgl" Catogory="${this.Options.Categories[i]}" alt="${this.Options.Categories[i]}">
                            <div class="Col_head" data-toggle="collapse" data-target="#${this.Options.Container}_G_${this.Options.Categories[i].replace(/\s/g, "")}">${this.Options.Categories[i].toUpperCase()}
                            <span class="FcnT">(0)</span></div>
                            <div class="Col_apndBody collapse" id="${this.Options.Container}_G_${this.Options.Categories[i].replace(/\s/g, "")}">
                            <div class="Col_apndBody_apndPort"></div></div>
            </div>`);
            }
        }
        return html.join("");
    }

    pullFile() {
        if ('FilesUrl' in this.Options && this.Options.FilesUrl) {
            $.ajax({
                url: this.Options.FilesUrl,
                type: "GET",
                cache: false,
                contentType: false,
                processData: false,
                beforeSend: function (evt) {
                    $(`#${this.Options.Container}-loader`).EbLoader("show");
                }.bind(this)
            }).done(function (list) {
                $(`#${this.Options.Container}-loader`).EbLoader("hide");
                this.FileList = JSON.parse(list);
                this.renderFiles();
            }.bind(this));
        }
    }

    renderFiles() {
        for (let i = 0; i < this.FileList.length; i++) {
            let $portdef = $(`#${this.Options.Container}_GalleryUnq div[Catogory="DEFAULT"] .Col_apndBody_apndPort`);
            let $countdef = $(`#${this.Options.Container}_GalleryUnq div[Catogory="DEFAULT"] .Col_head .FcnT`);

            if (this.FileList[i].Meta.Category.length <= 0) {
                $portdef.append(this.thumbNprevHtml(this.FileList[i]));
                $countdef.text("(" + $portdef.children().length + ")");
            }
            else {
                for (let k = 0; k < this.FileList[i].Meta.Category.length; k++) {
                    let $portcat = $(`#${this.Options.Container}_GalleryUnq div[Catogory="${this.FileList[i].Meta.Category[k]}"] .Col_apndBody_apndPort`);
                    let $countcat = $(`#${this.Options.Container}_GalleryUnq div[Catogory="${this.FileList[i].Meta.Category[k]}"] .Col_head .FcnT`);             
                    $portcat.append(this.thumbNprevHtml(this.FileList[i]));
                    $countcat.text("(" + $portcat.children().length + ")");
                }
            }
            $(`#prev-thumb${this.FileList[i].FileRefId}`).data("meta", JSON.stringify(this.FileList[i]));
        }

        $('.EbFupThumbLzy').Lazy({ scrollDirection: 'vertical' });
        $(".trggrFprev").off("click").on("click", this.galleryFullScreen.bind(this));
        $(".mark-thumb").off("click").on("click", function (evt) { evt.stopPropagation(); });
        this.contextMenu();
    }

    thumbNprevHtml(o) {
        return (`<div class="eb_uplGal_thumbO trggrFprev" id="prev-thumb${o.FileRefId}" filref="${o.FileRefId}">
                <div class="eb_uplGal_thumbO_img">
                    <img src="${this.SpinImage}" data-src="/images/small/${o.FileRefId}.jpg" class="EbFupThumbLzy" style="display: block;">
                <div><p class="fnamethumb text-center">${o.FileName}</p>
                <input type="checkbox" refid="${o.FileRefId}" name="Mark" class="mark-thumb">
                </div>
            </div>`);
    }

    galleryFullScreen(ev) {
        let fileref = $(ev.target).closest(".trggrFprev").attr("filref");
        this.GalleryFS.show();
        let o = JSON.parse($(ev.target).closest(".trggrFprev").data("meta"));

        if (is_cached(location.origin + `/images/large/${fileref}.jpg`)) {
            this.GalleryFS.eq(1).find('img').attr("src", `/images/large/${fileref}.jpg`);
        }
        else {
            this.GalleryFS.eq(1).find('img').attr("src", `/images/small/${fileref}.jpg`);
            this.GalleryFS.eq(1).find('img').attr("data-src", `/images/large/${fileref}.jpg`);
        }

        this.GalleryFS.eq(1).find(".ebFupGFscreen_footr .Fname").text(o.FileName);
        this.GalleryFS.eq(1).find(".ebFupGFscreen_footr .Tags").html(this.getTagsHtml(o));
        this.GalleryFS.eq(1).find('img').Lazy({
            onError: function (element) {
               console.log('error loading ' + element.data('src'));
           }
        });
        this.CurrentFimg = $(ev.target).closest(".trggrFprev");
    }

    getTagsHtml(o) {
        let html = new Array();
        if ("Tags" in o.Meta) {
            for (let i = 0; i < o.Meta.Tags.length; i++) {
                html.push(`<span class="tagno-t">${o.Meta.Tags[i]}</span>`);
            }
        }
        return html.join("");
    }

    initCropy() {
        return (new EbCropper({
            Container: 'container_crp',
            Toggle: '._crop',
            ResizeViewPort: this.Options.ResizeViewPort
        }));
    }

    cropImg(e) {
        this.Cropy.Url = $(e.target).closest(".file-thumb-wraper").find("img").attr("src");
        this.Cropy.FileName = $(e.target).closest(".eb-upl_thumb").attr("exact");
        this.Cropy.toggleModal();
    };

    onToggleM() {
        if (this.Options.ServerEventUrl)
            this.startSE();
    }

    toggleM() {
        this.Modal.modal("toggle");
    };

    ok() {
        this.toggleM();
        this.windowClose();
    };

    browse(e) {
        if (window.File && window.FileReader && window.FileList && window.Blob) {
            this.handleFileSelect(e);
        } else {
            alert('The File APIs are not fully supported in this browser.');
        }
    };

    handleDragOver(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.originalEvent.dataTransfer.dropEffect = "copy"; // Explicitly show this is a copy.
    }

    handleFileSelect(evt) {
        evt.stopPropagation();
        evt.preventDefault();

        let files = evt.target.files || evt.originalEvent.dataTransfer.files; // FileList object

        for (var i = 0; i < files.length; i++) {
            if (!files[i].type.match('image.*')) {
                continue;
            }
            let reader = new FileReader();
            reader.onload = (function (file) {

                if (!this.IsCropFlow)
                    return function (e) {
                        (this.validate(file)) ? this.drawThumbNail(e, file) : null;
                    }.bind(this);
                else
                    return function (e) {//cropy flow
                        (this.validate(file)) ? this.setCropUrl(e, file) : null;
                    }.bind(this);

            }.bind(this))(files[i]);

            reader.readAsDataURL(files[i]);
        }
    }

    setCropUrl(e, file) {//cropy flow
        this.Files[0] = file;
        this.FileName = file.name;
        this.Cropy.croppie('bind', {
            url: e.target.result,
        });
        $(`#${this.Options.Container}-upload-lin`).show();
    }

    validate(file) {
        let stat = true;
        for (let k in this.Files) {
            if (file.name === this.Files[k].name) {
                stat = false;
                break;
            }
        }
        //if (!this.Options.Multiple) {
        //    if (this.Files.length === 1)
        //        stat = false;
        //}
        return stat;
    }

    drawThumbNail(e, file) {
        if ((file.size / (1024)) < (this.MaxSize * 1024)) {
            $(`#${this.Options.Container}-eb-upl-bdy`).append(`
                                                        <div class="file-thumb-wraper">
                                                            <div class="eb-upl_thumb" exact="${file.name}" file="${this.replceSpl(file.name)}">
                                                                <div class="eb-upl-thumb-bdy">
                                                                    <img src="${e.target.result}"/>
                                                                </div>
                                                                <div class="eb-upl-thumb-info">
                                                                    <h4 class="fname text-center">${file.name}</h4>
                                                                    <h4 class="size text-center">${parseFloat((file.size / (1024))).toFixed(3)} Kb</h4>
                                                                </div>
                                                                <div class="eb-upl-loader">
                                                                    <div class="lds-spinner"><div></div><div></div><div></div><div></div><div></div>
                                                                    <div></div><div></div><div></div><div></div><div>
                                                                    </div><div></div><div></div></div>
                                                                 </div>
                                                                <div class="eb-upl-thumb-footer display-flex">
                                                                    ${this.thumbButtons(file)}
                                                                    <span class="fa fa-check-circle-o success"></span><span class="fa fa-exclamation-circle error"></span>                                                                    
                                                                </div>
                                                            </div>
                                                        </div>
                                                        `);

            $(`#${this.replceSpl(file.name)}-del`).off("click").on("click", this.delThumb.bind(this));
            $(`#${this.replceSpl(file.name)}-fullscreen`).off("click").on("click", this.setFullscreen.bind(this));

            if (this.Options.EnableTag) {
                $(`#${this.replceSpl(file.name)}-tags_input`).tagsinput();
                $(`#${this.replceSpl(file.name)}-tag`).off("click").on("click", this.tagClick.bind(this));
            }

            if (this.Options.EnableCrop)
                $(`#${this.replceSpl(file.name)}-crop`).off("click").on("click", this.cropImg.bind(this));

            this.Files.push(file);
            this.isDropZoneEmpty();
        }
        else {
            EbMessage("show", { Background: "red", Message: "Image size should not exceed " + this.MaxSize + " Mb" });
        }
    };

    tagClick(e) {
        $(e.target).closest("button").siblings(".upl-thumbtag").toggle();
    }

    thumbButtons(file) {
        let html = new Array();
        html.push(`<button class="upl-thumb-btn" size="${parseFloat((file.size / (1024))).toFixed(3)}" fname="${file.name}" id="${this.replceSpl(file.name)}-fullscreen"><i class="fa fa-arrows-alt"></i></button>`);
        html.push(`<button class="upl-thumb-btn" fname="${file.name}" id="${this.replceSpl(file.name)}-del"><i class="fa fa-trash-o"></i></button>`);

        if (this.Options.EnableTag)
            html.push(`<button class="upl-thumb-btn" fname="${file.name}" id="${this.replceSpl(file.name)}-tag"><i class="fa fa-tags"></i></button>
                        <div class="upl-thumbtag" id="${this.replceSpl(file.name)}-tagpop">
                             <input data-role="tagsinput"  id="${this.replceSpl(file.name)}-tags_input" type="text"/>
                        </div>`);

        if (this.Options.EnableCrop)
            html.push(` <button class="upl-thumb-btn _crop" fname="${file.name}" id="${this.replceSpl(file.name)}-crop"><i class="fa fa-crop"></i></button>`);
        if (this.Options.Categories)
            html.push(`<select class="ebfup_catogories" id="${this.replceSpl(file.name)}-category">${this.getCategory()}</select>`);
        return html.join("");
    }

    getCategory() {
        let html = new Array(`<option val="Default">Category</option>`);
        for (let i = 0; i < this.Options.Categories.length; i++) {
            html.push(`<option val="${this.Options.Categories[i]}">${this.Options.Categories[i]}</option>`);
        }
        return html.join("");
    }

    isDropZoneEmpty() {
        if (this.Files.length <= 0) {
            $(`#${this.Options.Container}-placeholder`).show();
            $(`#${this.Options.Container}-upload-lin`).hide();
        }
        else {
            $(`#${this.Options.Container}-placeholder`).hide();
            $(`#${this.Options.Container}-upload-lin`).show();
        }
    }

    delThumb(e) {
        let ctrl = $(e.target).closest("button");
        for (let i = 0; i < this.Files.length; i++) {
            if (this.Files[i].name === ctrl.attr("fname")) {
                this.Files.splice(i, 1);
                break;
            }
        }
        $(e.target).closest(".file-thumb-wraper").remove();
        document.getElementById("uploadtest-file-input").value = "";
        this.isDropZoneEmpty();
    }

    setFullscreen(e) {
        let txt = $(e.target).closest("button").attr("fname") + " (" + $(e.target).closest("button").attr("size") + " Kb)";
        this.FullScreen.modal("show");
        let ctrl = $(e.target).closest(".eb-upl_thumb");
        let img = ctrl.find("img").attr("src");
        this.FullScreen.find("img").attr("src", img);
        this.FullScreen.find(".img-info").text(txt);
    }

    upload(e) {
        if (this.IsCropFlow)
            this.contextUpload();
        else
            this.comUpload();
    };

    contextUpload() {
        this.cropClick();

        var url = "";
        if (this.Options.Context === "logo")
            url = "../StaticFile/UploadLogoAsync";
        else if (this.Options.Context === "dp")
            url = "../StaticFile/UploadDPAsync";
        else if (this.Options.Context === "location")
            url = "../StaticFile/UploadLocAsync";

        for (let k = 0; k < this.Files.length; k++) {
            let formData = new FormData(this.Files[k]);
            formData.append("File", this.Files[k]);
            formData.append("SolnId", this.Options.SolutionId || "");

            $.ajax({
                url: url,
                type: "POST",
                data: formData,
                cache: false,
                contentType: false,
                processData: false,
                beforeSend: function (evt) {
                    $(`#${this.Options.Container}-loader`).EbLoader("show");
                }.bind(this)
            }).done(function (refid) {
                $(`#${this.Options.Container}-loader`).EbLoader("hide");
                this.toggleM()
            }.bind(this));
        }
    }

    comUpload() {
        for (let k = 0; k < this.Files.length; k++) {
            let thumb = null;
            let formData = new FormData(this.Files[k]);
            formData.append("File", this.Files[k]);
            formData.append("Tags", this.getTag(this.Files[k]));

            if (this.Options.Categories)
                formData.append("Category", this.readCategory(this.Files[k]));

            $.ajax({
                url: "../StaticFile/UploadImageAsync",
                type: "POST",
                data: formData,
                cache: false,
                contentType: false,
                processData: false,
                beforeSend: function (evt) {
                    thumb = $(`#${this.Options.Container}-eb-upl-bdy div[file='${this.replceSpl(this.Files[k].name)}']`);
                    thumb.find(".eb-upl-loader").show();
                }.bind(this)
            }).done(function (refid) {
                this.successOper(thumb, refid);
            }.bind(this));
        }
    }

    cropClick(e) {//cropy flow
        this.Cropy.croppie('result', this.result).then(this.cropafter.bind(this));
    }

    cropafter(b64) {//cropy flow
        this.Cropy.croppie('bind', {
            url: b64,
        });

        let block = b64.split(";");
        let contentType = block[0].split(":")[1];
        let realData = block[1].split(",")[1];
        let blob = this.b64toBlob(realData, contentType);
        this.replaceFile(blob, this.FileName, contentType);
    };

    getTag(file) {
        let f = this.replceSpl(file.name);
        return $(`#${f}-tags_input`).tagsinput("items");
    }

    readCategory(file) {
        let f = this.replceSpl(file.name);
        return $(`#${f}-category`).val().split();
    }

    successOper(thumb, refid) {
        thumb.find(".eb-upl-loader").hide();
        if (refid > 0) {
            thumb.find(".success").show();
            thumb.find(".error").hide();
            thumb.closest('file-thumb-wraper').remove();
            for (let i = 0; i < this.Files.length; i++) {
                if (this.Files[i].name === thumb.attr("exact")) {
                    this.uploadSuccess(refid);
                    this.Files.splice(i, 1);
                    break;
                }
            }
        }
        else {
            thumb.find(".error").show()
            thumb.find(".success").hide();
        }
    }

    outerHtml() {
        $("body").append(`<div id="${this.Options.Container}-upl-container-outer" class="upl-container-outer">
                            <div id="${this.Options.Container}-upl-container" class="modal fade upl-container" role="dialog">
                              <div class="modal-dialog">
                                <div class="modal-content">
                                  <div class="modal-header">
                                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                                    <h4 class="modal-title">File Uploader</h4>
                                    <div id="${this.Options.Container}-loader" class="upl-loader"></div>
                                  </div>
                                  <div class="modal-body">
                                        <div class="eb-upl-dbywraper display-flex">
                                            ${this.decideCtrl()}
                                        </div>
                                  </div>
                                  <div class="modal-footer"> 
                                        <button class="modal-ok pull-right" id="${this.Options.Container}-upl-ok">Ok</button>
                                        <input type="file" id="${this.Options.Container}-file-input" style="display:none;" ${this.Multiple}/>
                                        <button class="browse-btn" onclick="$('#${this.Options.Container}-file-input').click();">
                                            <i class="fa fa-folder-open-o"></i> Browse
                                        </button>
                                        <button class="pull-right upload_btn eb_btngreen" id="${this.Options.Container}-upload-lin">
                                            <i class="fa fa-upload"></i> Upload
                                        </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>`);

        return $(`#${this.Options.Container}-upl-container`);
    }

    decideCtrl() {
        let html = null;
        if (!this.Options.Multiple && this.Options.EnableCrop) {
            html = `<div class="cropy_container">
                        <div id="${this.Options.Container}_cropy_container" class="cropy_container-inner">
                        </div>
                    </div>`;
        }
        else {
            html = `<div class="eb-upl-bdy" id="${this.Options.Container}-eb-upl-bdy">
                    <div class="placeholder" id="${this.Options.Container}-placeholder">Drop Files Here</div>
               </div>`;
        }
        return html;
    }

    fullScreen() {
        $("body").append(`<div id="${this.Options.Container}-upl-container-fullscreen" class="upl-container-fullscreen">
                            <div id="${this.Options.Container}-upl-fullscreen" class="modal fade upl-fullscreen" role="dialog">
                              <div class="modal-dialog">
                                <div class="modal-content">
                                  <div class="modal-header">
                                    <button type="button" class="close" data-dismiss="modal">&times;</button>
                                    <h4 class="modal-title display-inline">Detailed Preview</h4>
                                    <span class="img-info">amal.jpg 56.8 kb</span>
                                  </div>
                                  <div class="modal-body">
                                        <div class="upl-body">
                                            <img src=""/>
                                        </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>`);

        return $(`#${this.Options.Container}-upl-fullscreen`);
    };

    startSE() {
        this.ss = new EbServerEvents({ ServerEventUrl: this.Options.ServerEventUrl, Channels: ["file-upload"] });
        this.ss.onUploadSuccess = function (ImageRefid) {

        }.bind(this);
    }

    b64toBlob(b64Data, contentType, sliceSize) {
        contentType = contentType || '';
        sliceSize = sliceSize || 512;
        var byteCharacters = atob(b64Data);
        var byteArrays = [];
        for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
            var slice = byteCharacters.slice(offset, offset + sliceSize);
            var byteNumbers = new Array(slice.length);
            for (var i = 0; i < slice.length; i++) {
                byteNumbers[i] = slice.charCodeAt(i);
            }
            var byteArray = new Uint8Array(byteNumbers);
            byteArrays.push(byteArray);
        }
        var blob = new Blob(byteArrays, { type: contentType });
        return blob;
    }

    replaceFile(file, filename, contentType) {
        for (let k = 0; k < this.Files.length; k++) {
            if (filename === this.Files[k].name) {
                this.Files[k] = new File([file], filename, { type: contentType });
                break;
            }
        }
    }

    replceSpl(s) {
        try {
            return s.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/g, "").replace(/\s/g, "");
        }
        catch{
            return s.replace(".", "").replace(/\s/g, "");
        }
    };

    contextMenu() {
        $.contextMenu({
            selector: ".eb_uplGal_thumbO",
            autoHide: true,
            build: function ($trigger, e) {
                return {
                    items: {
                        "fold2": {
                            "name": "Move to Category", icon: "fa-list",
                            "items": this.getCateryLinks()
                        }
                    }
                };
            }.bind(this)
        });
    }

    getCateryLinks() {
        let o = {};
        for (let i = 0; i < this.Options.Categories.length; i++) {
            o[this.Options.Categories[i]] = {
                name: this.Options.Categories[i],
                icon: "",
                callback: this.contextMcallback.bind(this)
            };
        }
        return o;
    }

    contextMcallback(eType, selector, action, originalEvent) {
        let refids = [eval($(selector.$trigger).attr("filref"))];
        this.Gallery.find(`.mark-thumb:checkbox:checked`).each(function (i, o) {
            if (!refids.Contains(eval($(o).attr("refid"))))
                refids.push(eval($(o).attr("refid")));
        }.bind(this));
        this.changeCatAjax(eType, refids);
    }

    changeCatAjax(cat, fileref) {

        let formData = new FormData();
        formData.append("Category", cat);
        formData.append("FileRefs", fileref.join(","));

        $.ajax({
            url: "../StaticFile/ChangeCategory",
            type: "POST",
            data: formData,
            cache: false,
            contentType: false,
            processData: false,
            beforeSend: function (evt) {

            }.bind(this)
        }).done(function (status) {
            if (status)
                this.redrawCategry(fileref, cat);
        }.bind(this));
    }
    redrawCategry(fileref, cat) {
        let $t;
        for (let i = 0; i < fileref.length; i++) {
            $(`#${this.Options.Container}_GalleryUnq div[Catogory="${cat}"] .Col_apndBody_apndPort`).append(this.Gallery.find(`div[filref="${fileref[i]}"]`));
            $t = $(`#${this.Options.Container}_GalleryUnq div[Catogory="${cat}"] .Col_head .FcnT`);
            $t.text("(" + $(`#${this.Options.Container}_GalleryUnq div[Catogory="${cat}"] .Col_apndBody_apndPort`).children().length + ")");
        }
        this.Gallery.find(`.mark-thumb:checkbox:checked`).prop("checked",false)
    }
};