export class QuickHull {
  /*
   * @param {Object} cpt a point to be measured from the baseline
   * @param {Array} bl the baseline, as represented by a two-element
   *   array of latlng objects.
   * @returns {Number} an approximate distance measure
   */
  getDistant(cpt, bl) {
    var vY = bl[1].lat - bl[0].lat,
      vX = bl[0].lng - bl[1].lng;
    return vX * (cpt.lat - bl[0].lat) + vY * (cpt.lng - bl[0].lng);
  }

  /*
   * @param {Array} baseLine a two-element array of latlng objects
   *   representing the baseline to project from
   * @param {Array} latLngs an array of latlng objects
   * @returns {Object} the maximum point and all new points to stay
   *   in consideration for the hull.
   */
  findMostDistantPointFromBaseLine(baseLine, latLngs) {
    var maxD = 0,
      maxPt = null,
      newPoints = [],
      i,
      pt,
      d;

    for (i = latLngs.length - 1; i >= 0; i--) {
      pt = latLngs[i];
      d = this.getDistant(pt, baseLine);

      if (d > 0) {
        newPoints.push(pt);
      } else {
        continue;
      }

      if (d > maxD) {
        maxD = d;
        maxPt = pt;
      }
    }

    return { maxPoint: maxPt, newPoints: newPoints };
  }

  /*
   * Given a baseline, compute the convex hull of latLngs as an array
   * of latLngs.
   *
   * @param {Array} latLngs
   * @returns {Array}
   */
  buildConvexHull(baseLine, latLngs) {
    var convexHullBaseLines = [],
      t = this.findMostDistantPointFromBaseLine(baseLine, latLngs);

    if (t.maxPoint) {
      // if there is still a point "outside" the base line
      convexHullBaseLines = convexHullBaseLines.concat(
        this.buildConvexHull([baseLine[0], t.maxPoint], t.newPoints)
      );
      convexHullBaseLines = convexHullBaseLines.concat(
        this.buildConvexHull([t.maxPoint, baseLine[1]], t.newPoints)
      );
      return convexHullBaseLines;
    } else {
      // if there is no more point "outside" the base line, the current base line is part of the convex hull
      return [baseLine[0]];
    }
  }

  /*
   * Given an array of latlngs, compute a convex hull as an array
   * of latlngs
   *
   * @param {Array} latLngs
   * @returns {Array}
   */
  getConvexHull(latLngs) {
    // find first baseline
    var maxLat = false,
      minLat = false,
      maxLng = false,
      minLng = false,
      maxLatPt = null,
      minLatPt = null,
      maxLngPt = null,
      minLngPt = null,
      maxPt = null,
      minPt = null,
      i;

    for (i = latLngs.length - 1; i >= 0; i--) {
      var pt = latLngs[i];
      if (maxLat === false || pt.lat > maxLat) {
        maxLatPt = pt;
        maxLat = pt.lat;
      }
      if (minLat === false || pt.lat < minLat) {
        minLatPt = pt;
        minLat = pt.lat;
      }
      if (maxLng === false || pt.lng > maxLng) {
        maxLngPt = pt;
        maxLng = pt.lng;
      }
      if (minLng === false || pt.lng < minLng) {
        minLngPt = pt;
        minLng = pt.lng;
      }
    }

    if (minLat !== maxLat) {
      minPt = minLatPt;
      maxPt = maxLatPt;
    } else {
      minPt = minLngPt;
      maxPt = maxLngPt;
    }

    var ch = [].concat(
      this.buildConvexHull([minPt, maxPt], latLngs),
      this.buildConvexHull([maxPt, minPt], latLngs)
    );
    return ch;
  }
}
