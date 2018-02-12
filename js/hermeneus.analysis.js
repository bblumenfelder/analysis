import Helpers from '../../helpers/hermeneus.global_helpers'

export default class Analysis {
    constructor (TargetElement, AttributeName) {
        this.AttributeName = AttributeName;
        this.element = TargetElement;
        this.keyword = TargetElement.textContent;
        //this.analysis = (async function() {await Analysis.read(TargetElement, AttributeName)})();
        this.analysis =  Analysis.read(TargetElement, AttributeName);
        this.api_get_url = '/analysieren/';


        this.LoadingStatus = false;
    }


    /**
     * Map Object so it contains 'IsActual'-property and 'bedeutung'-property
     * @param BestimmungenParsed
     */
    static mapBestimmungen (BestimmungenParsed) {
        return BestimmungenParsed.map(LemmaBestimmung => {
            // Add new property
            LemmaBestimmung = Analysis.createIsActualProperty(LemmaBestimmung);
            LemmaBestimmung = Analysis.createBedeutungProperty(LemmaBestimmung);
            return LemmaBestimmung;
        });
    }


    /**
     * Create property in JSON if doesn't exist
     * @param LemmaBestimmung
     * @returns {*}
     */
    static createIsActualProperty (LemmaBestimmung) {
        if (!LemmaBestimmung.hasOwnProperty('isActual')) {
            LemmaBestimmung.isActual = false;
        }
        return LemmaBestimmung;
    }


    /**
     * Create property in JSON if doesn't exist
     * @param LemmaBestimmung
     * @returns {*}
     */
    static createBedeutungProperty (LemmaBestimmung) {
        if (!LemmaBestimmung.hasOwnProperty('bedeutung')) {
            LemmaBestimmung.bedeutung = '';
        }
        return LemmaBestimmung;
    }


    /**
     *
     * @param DOMElement
     * @param AttributeName
     * @returns {*}
     */
    static read (DOMElement, AttributeName) {
            if (DOMElement.getAttribute(AttributeName)) {
                let BestimmungenValue = DOMElement.getAttribute(AttributeName);
                // Parse attribute to JSON and replace single quotes with double quotes
                let BestimmungenParsed = JSON.parse(Helpers.substituteSingleQuotes(BestimmungenValue));
                // If there actually is data
                if (BestimmungenParsed.length > 0) {
                    return Analysis.mapBestimmungen(BestimmungenParsed);
                }
                else {
                    return Analysis.EmptyAnalysis;
                }
            }
            else {
                return Analysis.EmptyAnalysis;
            }
    }
    /**
     *
     * @param DOMElement
     * @param AttributeName
     * @returns {*}
     */
    static readPromise (DOMElement, AttributeName) {
        return new Promise((resolve, reject) => {
            if (DOMElement.getAttribute(AttributeName)) {
                let BestimmungenValue = DOMElement.getAttribute(AttributeName);
                // Parse attribute to JSON and replace single quotes with double quotes
                let BestimmungenParsed = JSON.parse(Helpers.substituteSingleQuotes(BestimmungenValue));
                // If there actually is data
                if (BestimmungenParsed.length > 0) {
                    resolve(Analysis.mapBestimmungen(BestimmungenParsed));
                }
                else {
                    resolve(Analysis.EmptyAnalysis);
                }
            }
            else {
                resolve(Analysis.EmptyAnalysis);
            }
        });
    }


    /**
     * Retrieve Word analysis from API
     * @param Keyword
     */
    analyze (Keyword) {
        let Form = Analysis.sanitizeKeyword(Keyword);
        this.LoadingStatus = true;
        axios.get(this.api_get_url + Form).then(response => {
            this.analysis = Analysis.mapBestimmungen(response.data);
            this.LoadingStatus = false;
        });
    }



    /**
     * Sanitize keyword for analysis-API-request via route
     * @param Keyword
     * @returns {string}
     */
    static sanitizeKeyword (Keyword) {
        return Keyword.trim().toLowerCase();
    }



    static get EmptyAnalysis () {
        return [{
            "lemma": "",
            "wortart": "",
            "id": "",
            "bestimmungen": [],
            "isActual": false,
            "bedeutung": ""
        }];

    }


    /**
     * Update DOM and temporarily add class to saveButton as confirmation signal
     * @param event
     */
    save (event) {
        this.update();
        let saveButton = event.target;
        Helpers.toggleClassFor(saveButton, 'btn-save-confirmed', 1000);
    }


    /**
     * Update DOM
     */
    update () {
        let NewBestimmungAttribute = JSON.stringify(this.analysis);
        this.element.setAttribute(this.AttributeName, NewBestimmungAttribute);
    }



    /**
     * Set Lemma of selected word as actual lemma
     * @param index
     * @param bestimmung
     */
    setLemmaActual (index, bestimmung) {
        this.analysis[index].isActual = true;
    }


    /**
     * Set Lemma of selected word as actual lemma
     * @param index
     * @param bestimmung
     */
    unsetLemmaActual (index, bestimmung) {
        this.analysis[index].isActual = false;
    }


    /**
     * Delete bestimmung of lemma by index
     * @param bestimmungIndex
     */
    deleteLemmaBestimmung (bestimmungIndex) {
        this.analysis.splice(bestimmungIndex, 1);
    }



    /**
     * Extract and format bestimmungen-Attribute from selected element s
     * @param DOMElement
     * @returns {*}
     */
    static getFor (DOMElement) {
        if (DOMElement !== null) {
            let BestimmungAttribute = DOMElement.getAttribute('bestimmung');
            if (BestimmungAttribute) {
                // Parse attribute to JSON and replace single quotes with double quotes
                let BestimmungenParsed = JSON.parse(BestimmungAttribute.replace(/\'/g, '"'));
                // If there actually is data
                if (BestimmungenParsed.length > 0) {
                    return Analysis.mapBestimmungen(BestimmungenParsed);
                }
            }
        }
    }


    /**
     * Extract and format bestimmungen-Attribute from selected element s
     * @param Element
     * @returns {*}
     */
    static getFor2 (Element) {
        if (Element !== null) {

            let Attributes = {};
            let AttributesNodeList = Element.attributes;

            for (let i = 0; i < AttributesNodeList.length; i++) {
                Attributes[AttributesNodeList[i].name] = AttributesNodeList[i].value;
            }
            if (Attributes.hasOwnProperty('bestimmung')) {
                // Parse attribute to JSON and replace single quotes with double quotes
                let BestimmungenParsed = JSON.parse(Attributes.bestimmung.replace(/\'/g, '"'));
                // If there actually is data
                if (BestimmungenParsed.length > 0) {
                    return Analysis.mapBestimmungen(BestimmungenParsed);
                }
            }
        }
    }
}