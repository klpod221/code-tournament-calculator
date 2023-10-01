$(function () {
/**
 * BigNumber constructor.
 *
 * @param {String|Number|BigNumber} [n=0] A numeric value.
 * @param {Number} [p] The decimal precision of the value.
 * @param {Number} [r] The rounding mode used when rounding to the specified precision. ROUND_HALF_UP by default.
 * @returns {BigNumber}
 */
BigNumber = function (n, p, r) {
  // Enable constructor usage without new.
  if (!(this instanceof BigNumber)) return new BigNumber(n, p, r);

  // Create internal state object.
  let o = this,
    i;

  // if n is already a BigNumber instance, return a copy of it.
  if (n instanceof BigNumber) {
    // loop through the keys assigned to n
    for (i in { precision: 0, roundType: 0, _s: 0, _f: 0 }) o[i] = n[i];
    o._d = n._d.slice();
    return;
  }

  // Accept numbers and numeric strings.
  o.precision = isNaN((p = Math.abs(p))) ? BigNumber.defaultPrecision : p;

  // Accept rounding mode.
  o.roundType = isNaN((r = Math.abs(r))) ? BigNumber.defaultRoundType : r;

  // Check if we're dealing with a negative number.
  o._s = (n += "").charAt(0) == "-";

  // Decimal point location.
  o._f = ((n = n.replace(/[^\d.]/g, "").split(".", 2))[0] =
    n[0].replace(/^0+/, "") || "0").length;

  // Assign digits.
  for (
    i = (n = o._d = (n.join("") || "0").split("")).length;
    i;
    n[--i] = +n[i]
  );

  // Remove trailing zeros.
  o.round();
};

const $ = BigNumber;
const o = BigNumber.prototype;

// default values
$.ROUND_HALF_EVEN = 0;
$.ROUND_HALF_UP = 1;
$.ROUND_HALF_DOWN = 2;
$.FLOOR = 3;
$.CEIL = 4;
$.DOWN = 5;
$.UP = 6;

$.defaultPrecision = 40;
$.defaultRoundType = $.ROUND_HALF_UP;

/**
 * Add two BigNumbers.
 *
 * @param {String|Number|BigNumber} n A numeric value.
 * @return {BigNumber} The sum of the two numbers.
 */
o.add = function (n) {
  // Check if we're dealing with a negative number.
  if (this._s != (n = new BigNumber(n))._s) return (n._s ^= 1), this.sub(n);

  // Create a copy of the values we'll be using.
  var o = new BigNumber(this),
    a = o._d,
    b = n._d,
    la = o._f,
    lb = n._f,
    n = Math.max(la, lb),
    i,
    r;

  // Equalize decimal points.
  la != lb && ((lb = la - lb) > 0 ? o._zeroes(b, lb, 1) : o._zeroes(a, -lb, 1));

  // Add/subtract the values.
  i =
    (la = a.length) == (lb = b.length)
      ? a.length
      : ((lb = la - lb) > 0 ? o._zeroes(b, lb) : o._zeroes(a, -lb)).length;

  // Calculate the sum.
  for (r = 0; i; r = ((a[--i] = a[i] + b[i] + r) / 10) >>> 0, a[i] %= 10);

  // Check if we need to carry the one.
  r && ++n && a.unshift(r);

  // Remove trailing zeros.
  return (o._f = n), o.round();
};

/**
 * Subtract two BigNumbers.
 *
 * @param {String|Number|BigNumber} n A numeric value.
 * @return {BigNumber} The difference of the two numbers.
 */
o.sub = function (n) {
  // Check if we're dealing with a negative number.
  if (this._s != (n = new BigNumber(n))._s) return (n._s ^= 1), this.add(n);

  // Create a copy of the values we'll be using.
  var o = new BigNumber(this),
    c = o.abs().compare(n.abs()) + 1,
    a = c ? o : n,
    b = c ? n : o,
    la = a._f,
    lb = b._f,
    d = la,
    i,
    j;

  // Equalize decimal points.
  (a = a._d),
    (b = b._d),
    la != lb &&
      ((lb = la - lb) > 0 ? o._zeroes(b, lb, 1) : o._zeroes(a, -lb, 1));

  // Subtract the values.
  // i is the length of the longer array
  // j is the length of the shorter array
  for (
    i =
      (la = a.length) == (lb = b.length)
        ? a.length
        : ((lb = la - lb) > 0 ? o._zeroes(b, lb) : o._zeroes(a, -lb)).length;
    i;

  ) {
    // if a[i] < b[i], we need to borrow
    if (a[--i] < b[i]) {
      // find the first non-zero number to the left of a[i]
      for (j = i; j && !a[--j]; a[j] = 9);

      // decrement that number by one and add 10 to a[i]
      --a[j], (a[i] += 10);
    }

    // subtract b[i] from a[i]
    b[i] = a[i] - b[i];
  }

  // Remove trailing zeros.
  return c || (o._s ^= 1), (o._f = d), (o._d = b), o.round();
};

o.multiply = function (n) {
  // Create a copy of the values we'll be using.
  var o = new BigNumber(this),
    r = o._d.length >= (n = new BigNumber(n))._d.length,
    a = (r ? o : n)._d,
    b = (r ? n : o)._d,
    la = a.length,
    lb = b.length,
    x = new BigNumber(),
    i,
    j,
    s;

  // Multiply each digit of a by each digit of b.
  // i is the loop index for a
  // j is the loop index for b
  // s is the current sum of products plus carry
  for (i = lb; i; r && s.unshift(r), x.set(x.add(new BigNumber(s.join("")))))
    for (
      s = new Array(lb - --i).join("0").split(""), r = 0, j = la;
      j;
      r += a[--j] * b[i], s.unshift(r % 10), r = (r / 10) >>> 0
    );

  // Add the final carry. If it's bigger than 0, add it as
  // another digit on the left side.
  return (
    (o._s = o._s != n._s),
    (o._f =
      ((r = la + lb - o._f - n._f) >= (j = (o._d = x._d).length)
        ? this._zeroes(o._d, r - j + 1, 1).length
        : j) - r),
    o.round()
  );
};

o.div = function (n) {
  // Check if n is 0 (division by 0 is not allowed).
  if ((n = new BigNumber(n)) == "0") throw new Error("Division by 0");
  else if (this == "0") return new BigNumber();

  // Create copies of the values.
  var o = new BigNumber(this),
    a = o._d,
    b = n._d,
    la = a.length - o._f,
    lb = b.length - n._f,
    r = new BigNumber(),
    i = 0,
    j,
    s,
    l,
    f = 1,
    c = 0,
    e = 0;

  // Normalize values (divide by their highest digit count).
  // Note that this will never shorten the number of digits
  // in the result, so we'll have to pad them with zeros
  // later.
  (r._s = o._s != n._s),
    (r.precision = Math.max(o.precision, n.precision)),
    (r._f = +r._d.pop()),
    la != lb && o._zeroes(la > lb ? b : a, Math.abs(la - lb));

  // Determine the result's length.
  (n._f = b.length), (b = n), (b._s = false), (b = b.round());

  // Pad zeros to the right of the value until we have
  // at least the precision we specified.
  for (n = new BigNumber(); a[0] == "0"; a.shift());

  out: do {
    // 1. Find the first digit of b that's smaller than a's first digit.
    //    1a. If you can't find such a digit, go to step 4.
    // 2. Calculate how many times that digit can be subtracted from a's
    //    first digit. Append that digit to the result.
    // 3. Subtract that digit times b from a. If you can't subtract that
    //    many times, go to step 4.
    // 4. If a's length is less than b's, append zeros to the right of a
    //    until their lengths are equal. If a's length is still less than
    //    b's, go to step 1.
    // 5. If a is less than b, subtract a from b and go to step 1.
    // 6. Go to step 1.
    // Note that this algorithm stops when the result is longer than the
    // precision + 1 (a._f is the precision of a, b._f is the precision
    // of b, and r._f is the precision of the result).
    for (
      l = c = 0, n == "0" && ((n._d = []), (n._f = 0));
      i < a.length && n.compare(b) == -1;
      ++i
    ) {
      ((l = i + 1 == a.length),
      (!f && ++c > 1) || (e = l && n == "0" && a[i] == "0")) &&
        (r._f == r._d.length && ++r._f, r._d.push(0));
      (a[i] == "0" && n == "0") || (n._d.push(a[i]), ++n._f);
      if (e) break out;
      if (
        (l && n.compare(b) == -1 && (r._f == r._d.length && ++r._f, 1)) ||
        (l = 0)
      )
        while ((r._d.push(0), n._d.push(0), ++n._f, n.compare(b) == -1));
    }

    // After the out loop breaks, if the length of the result
    // is still less than the precision, add zeros to the right
    // of the result until the length matches the precision.
    if (((f = 0), n.compare(b) == -1 && !(l = 0)))
      while (
        (l ? r._d.push(0) : (l = 1), n._d.push(0), ++n._f, n.compare(b) == -1)
      );
    for (
      s = new BigNumber(), j = 0;
      n.compare((y = s.add(b))) + 1 && ++j;
      s.set(y)
    );

    // Append the digit.
    r._d[r._d.length - j]++;
    n.set(n.sub(s)), !l && r._f == r._d.length && ++r._f, r._d.push(j);
  } while ((i < a.length || n != "0") && r._d.length - r._f <= r.precision);

  // Remove trailing zeros.
  return r.round();
};

o.mod = function (n) {
  return this.sub(this.div(n).intPart().multiply(n));
};

o.pow = function (n) {
  // Create a copy of the value.
  var o = new BigNumber(this),
    i;

  // if n is 0, return 1
  if ((n = new BigNumber(n).intPart()) == 0) return o.set(1);

  // Multiply the value by itself n times.
  for (i = Math.abs(n); --i; o.set(o.multiply(this)));

  // Invert if the value is negative.
  return n < 0 ? o.set(new BigNumber(1).div(o)) : o;
};

o.set = function (n) {
  return this.constructor(n), this;
};

o.compare = function (n) {
  // Create copies of each value.
  var a = this,
    la = this._f,
    b = new BigNumber(n),
    lb = b._f,
    r = [-1, 1],
    i,
    l;

  if (a._s != b._s) return a._s ? -1 : 1;
  if (la != lb) return r[(la > lb) ^ a._s];

  // Compare digits.
  for (
    la = (a = a._d).length,
      lb = (b = b._d).length,
      i = -1,
      l = Math.min(la, lb);
    ++i < l;

  )
    if (a[i] != b[i]) return r[(a[i] > b[i]) ^ a._s];

  // Compare lengths.
  return la != lb ? r[(la > lb) ^ a._s] : 0;
};

o.negate = function () {
  var n = new BigNumber(this);

  // Invert the sign of this value.
  return (n._s ^= 1), n;
};

o.abs = function () {
  var n = new BigNumber(this);

  // Invert the sign if it's negative, otherwise return a copy.
  return (n._s = 0), n;
};

o.intPart = function () {
  // Cut off the decimals and return an integer.
  return new BigNumber(
    (this._s ? "-" : "") + (this._d.slice(0, this._f).join("") || "0")
  );
};

o.valueOf = o.toString = function () {
  var o = this;

  // Convert to string notation.
  return (
    (o._s ? "-" : "") +
    (o._d.slice(0, o._f).join("") || "0") +
    (o._f != o._d.length ? "." + o._d.slice(o._f).join("") : "")
  );
};

o._zeroes = function (n, l, t) {
  // Create an array of zeros.
  var s = ["push", "unshift"][t || 0];

  // Append/prefix zeros to the array until the length is l.
  for (++l; --l; n[s](0));

  // Return the array.
  return n;
};

o.round = function () {
  // check for rounding
  if ("_rounding" in this) return this;

  // setup default values
  var $ = BigNumber,
    r = this.roundType,
    b = this._d,
    d,
    p,
    n,
    x;


  // this code finds the first digit (d) and the precision (p) of a number (n)
  // then it removes all trailing zeros from the number (n)
  // then it returns the number (n) as a string
  for (
    d = this._f, p = this.precision + d, n = b[p];
    b.length > d && !b[b.length - 1];
    b.pop()
  );

  // This code converts a floating-point number to a string.
  // It is used in the toString method of the Rational class.
  // The identifier p is the precision of the number, and d is
  // the number of digits to the left of the decimal point.
  x =
    (this._s ? "-" : "") +
    (p - d ? "0." + this._zeroes([], p - d - 1).join("") : "") +
    1;

  // Check if we're rounding up or down.
  if (b.length > p) {
    n &&
      (r == $.DOWN
        ? false
        : r == $.UP
        ? true
        : r == $.CEIL
        ? !this._s
        : r == $.FLOOR
        ? this._s
        : r == $.HALF_UP
        ? n >= 5
        : r == $.HALF_DOWN
        ? n > 5
        : r == $.HALF_EVEN
        ? n >= 5 && b[p - 1] & 1
        : false) &&
      this.add(x);
    b.splice(p, b.length - p);
  }

  return delete this._rounding, this;
};
});
